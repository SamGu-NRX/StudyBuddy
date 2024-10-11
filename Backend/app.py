import requests
import json
import os
from os.path import join, dirname
from dotenv import load_dotenv
from openai import OpenAI
from flask import Flask

dotenv_path = "../.env.local"
load_dotenv(dotenv_path)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
MONGO_PASSWORD = os.environ.get("DATABASE_PASSWORD")

app = Flask(__name__)
client = OpenAI(api_key=OPENAI_API_KEY)

#
#
# run with `python3 -m flask run` or `python -m flask run`
#
#

def delete_thread(thread_id):
    url = f"https://api.openai.com/v2/threads/{thread_id}"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
    }
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 200:
        print(f'Successfully deleted thread: {thread_id}')
    else:
        print(f'Error deleting thread: {thread_id}. Status code: {response.status_code}')

def create_flashcards(context):
    thread = None
    try:
        # Create a thread
        thread = client.beta.threads.create()

        # Create a message in the new thread
        client.beta.threads.messages.create(
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
            run_status = client.beta.threads.runs.retrieve(
                thread_id=thread.id,
                run_id=run.id
            )

            #print(f"Status: {run_status.status}")
            if run_status.status in ["completed", "failed"]:
                break

        if run_status.status == "completed":
            # Retrieve messages from the completed thread
            messages = client.beta.threads.messages.list(thread_id=thread.id)

            # Get the latest message from the assistant
            for message in messages:
                if message.role == "assistant":
                    return message.content[0].text.value

        else:
            print(f"Run failed with status: {run_status.status}")
            return None

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

@app.route("/<string:ctx>")
def hello_world(ctx):
    print(ctx)
    result = create_flashcards(ctx)
    if result:
        try:
            result2 = json.loads(result)
            print("Generated flashcards:")
            result2["error"] = False
            delete_thread(thread_id=result2["id"])
            return result2
        except:
            return {"error": True}
    else:
        return {"error": True}