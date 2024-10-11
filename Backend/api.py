import requests
import openai
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pymongo.mongo_client import MongoClient
from typing import List
from dotenv import load_dotenv
import json
import os

OPEN_API_KEY = os.getenv("OPEN_API_KEY")  #replace with environment variable
app = FastAPI()

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)
db = client['File']
flashcard_collection = db['Flashcards']
mcq_collection = db['MCQuestions']

def delete_thread(self, thread_id):
    url = f"https://api.openai.com/v1/threads/{thread_id}"
    headers = {
        "Authorization": f"Bearer {OPEN_API_KEY}",
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v1"
    }
    response = requests.delete(url, headers=headers)
    res = response.json()
    
    if res.get("deleted", False):
        print('Successfully deleted thread: ' + thread_id)
    else:
        print('Error with deleting: ' + thread_id)

def gpt(context):
    client = openai.OpenAI(api_key=OPEN_API_KEY)
    thread = client.beta.threads.create()
    
    # Create a message in the new thread
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=context,
    )
    
    # Start a run in the newly created thread
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id="asst_PTpGlF4xFObbEBUYl1IHO6Aq"
    )
    
    # Wait for the run to complete
    while True:
        keep_retrieving_run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )
        
        print(f"Status: {keep_retrieving_run.status}")
        if keep_retrieving_run.status == "completed":
            print("\n")
            break
        if keep_retrieving_run.status == "failed":
            print("\n")
            break
    
    # Retrieve and store messages from the completed thread
    returned_messages = client.beta.threads.messages.list(
        thread_id=thread.id
    )
    
    # Assuming you want to store the response from the assistant
    returned_value = returned_messages.data[0].content[0].text.value
    
    # Delete the thread after use
    delete_thread(thread.id)
    return returned_value

@app.post("/create-flashcards/")
async def create_flashcards(user_id, files: List[UploadFile] = File(...)):
    
    storage_urls = []
    
    for file in files:
        file_location = f"/tmp/{file.filename}"
        
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())
        
        url = upload_to_storage(file_location, 'storage place', file.filename)
        # per person
        
        if not url:
            raise HTTPException(status_code=500, detail="File upload failed")
        
        storage_urls.append(url)
        
        # Clean up the temporary file
        os.remove(file_location)
    
    #### Generate the flashcards
    prompt = f"Please follow the instructions based on these documents:\n\n" + "\n".join(storage_urls)
    raw_flashcards = gpt(prompt)
    
    #### Process raw_flashcards into json style
    json_flashcards = raw_flashcards  #dictionary
    
    ### upload to monogoDB, and return to frontend
    flashcard_collection.insert_one(json_flashcards)
    return JSONResponse(content=json_flashcards)

@app.post("/generate-mcq/")
async def generate_mcq(context: str):
    prompt = f"""
    Given the following context, generate 5 multiple-choice questions (MCQs) with 4 options each. 
    Ensure that one option is correct and the other three are plausible but incorrect.
    Format the output as a JSON array of objects, where each object has the following structure:
    {{
        "id": "unique_id",
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option"
    }}

    Context: {context}
    """
    
    raw_mcq = gpt(prompt)
    
    try:
        json_mcq = json.loads(raw_mcq)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse MCQ response")
    
    # Validate the structure of the JSON
    if not isinstance(json_mcq, list) or len(json_mcq) != 5:
        raise HTTPException(status_code=500, detail="Invalid MCQ response structure")
    
    for question in json_mcq:
        if not all(key in question for key in ["id", "question", "options", "correctAnswer"]):
            raise HTTPException(status_code=500, detail="Invalid MCQ question structure")
        if len(question["options"]) != 4:
            raise HTTPException(status_code=500, detail="Invalid number of options in MCQ question")
    
    # Store in MongoDB
    mcq_collection.insert_one({"context": context, "questions": json_mcq})
    
    return JSONResponse(content=json_mcq)