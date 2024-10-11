<h1 align="center">StudyBuddy</h1>

<p align="center">
  <strong>Improve your learning skills with an all-in-one, personalized education assistant.</strong><br>
  Unlimited MCQ and flashcard generation for standardized tests, difficult subjects, and active recall.<br>
  <a href="https://devpost.com/software/studybuddy-qgdn7b">Best Education Project</a> • Boost Hacks II
</p>

---

## Features

### Dashboard Overview
Smooth animations and real-time statistics
<p align="center">
  <img src="https://github.com/user-attachments/assets/33cfdb54-187d-4814-b175-21fbe5fedc0e" alt="Dashboard and Statistics Page" width="600">
</p>

### Responsive Onboarding
Document upload & Advanced OCR (server computing via Tesseract.js) linking to local storage (refresh resistant)
<p align="center">
  <img src="https://github.com/user-attachments/assets/3617e8c8-9511-4462-90ef-a42773edd12e" alt="Onboarding" width="600">
</p>

## How It's Made

<table>
  <tr>
    <td><strong>Front-end</strong></td>
    <td>React, Next.js, Tailwind CSS</td>
  </tr>
  <tr>
    <td><strong>Back-end</strong></td>
    <td>MongoDB, Prisma ORM, Flask</td>
  </tr>
  <tr>
    <td><strong>APIs</strong></td>
    <td>Resend (Emailing/Authentication), NextAuth (Authentication), Tesseract.js (OCR)</td>
  </tr>
  <tr>
    <td><strong>Hosting</strong></td>
    <td>Vercel (full-stack)</td>
  </tr>
</table>


## Project Status

### To-Do
- [ ] Develop even more personalized shuffle algorithm for even better active recall
- [ ] More robust fact-checking for optimal accuracy
- [ ] Integrate with popular learning management systems (such as notion)
- [ ] Deploy backend to sustainable service (GPU access)
- [ ] Set up automated testing pipeline

### Finished
- [x] Design and implement dashboard UI
- [x] Implement robust user authentication system with settings, confirmation emails, password changing, and more
- [x] Set up MongoDB database with Prisma ORM, connected with OpenAI API using Flask
- [x] **AI-powered learning system** accepting long context files for optimal question and flashcard generation
- [x] Basic **fact-checking** for material generation
- [x] Implement document upload functionality
- [x] Integrate Tesseract.js for OCR capabilities
- [x] Create mobile-responsive design


## Lessons Learned

Our team gained valuable experience in:
- Effectively using NextJS for dynamic **full-stack** development
- Implementing AI tools on the backend, including GPT's APIs for content generation
- Debugging and problem-solving in a hackathon environment
- Project management and effective team communication

## How to Run

### Requirements
Before you begin, ensure you have met the following requirements:

- A modern web browser
- Python 3 and pip
- Node.js installed on your machine
- and a JS package manager (pnpm recommended)

### Step 1: Node Setup and Run
```bash
# Using pnpm (recommended)
./setup.sh  # or ./setup.bat on Windows

# Or, if not using pnpm
<package manager> install
<package manager run (ex: npx)> prisma generate
<package manager run (ex: npx)> prisma db push
<package manager> run dev
```

### Step 2: Python Setup and Run
```bash
cd ./Backend
pip install -r ./requirements.txt
python -m flask run
```
> Ensure the Flask app runs on port 5000 or update the `.env` file accordingly.
> Default: `FLASK_API_URL=http://127.0.0.1:5000/`

### Step 3: Run Next.js Dev Server
```bash
cd ..
next dev  # or npm/pnpm run dev, depending on your setup
```
---

<p align="center">
  <a href="https://nextjs.org/">Next.js</a> •
  <a href="https://github.com/vercel/next.js/tree/canary/packages/create-next-app">create-next-app</a>
</p>
