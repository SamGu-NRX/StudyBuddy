---
# kgu.one builds this project's page from this file (https://kgu.one/projects/studybuddy).
# When a change alters what the project does, its results, awards, stack or links,
# update this file in the same change. Rules:
# - Facts only, each one backed by this repo, the resume or a public source.
# - No em dashes and no middle dots.
# - line: at most 120 characters, ending in a period. What someone does or gets,
#   then one mechanism. No adjectives.
# - The body opens with one paragraph of 50 to 80 words, first person: what it is,
#   who used it, the hard part, one fact. The site uses it as the summary.
# - The rest of the body is the full write-up, in plain Markdown (## and ###
#   headings, lists, emphasis, inline code, https links), at most 1,500 words.
title: StudyBuddy
kind: project
date: 2024-07
line: The tutor you don’t have, built from your syllabus. Get practice questions and see which concepts you still miss.
award: Best Education Project, Boost Hacks II
badge: Winner
stack: [GPT-4o]
links:
  - label: Code
    href: https://github.com/SamGu-NRX/StudyBuddy
---

StudyBuddy is a study assistant for first-generation and low-income students who don’t have a tutor on call. You upload your syllabus and notes, GPT-4o writes multiple-choice questions and flashcards grounded in them, and the app tracks your answers to show which concepts you’re still missing. I led the five-person team at Boost Hacks II, where it won Best Education Project and placed in the top five of 1,272 entries.

A good tutor knows your course. StudyBuddy starts from the documents your class uses, so the questions follow your syllabus instead of a generic deck.

## From a syllabus to a deck

1. Upload. You drop in a syllabus, lecture notes or textbook pages. Uploads go through OCR with Tesseract.js on the server and persist in local storage, so a refresh doesn’t lose them.
2. Generate. A Flask backend sends the text to a GPT-4o assistant for flashcards and multiple-choice questions. The flashcard assistant’s configuration asks for 25 cards as JSON, tells the model to use only the documents you provided and to cite them where it can, and sets the temperature to 0.2.
3. Practice. You work through the questions and cards, and the dashboard shows your statistics as you go.
4. Review. Progress tracking and error analysis surface the concepts you keep missing, so you know what to study next.

I built the GPT-4o content-generation pipeline, the progress tracking and the error analysis. The rest of the stack is Next.js with Tailwind on the front end, MongoDB with Prisma for data, and NextAuth with Resend for sign-in, confirmation emails and password changes, hosted on Vercel. The layout also works on a phone.

## What we didn’t finish

There’s a fact-checking pass on generated material, but it’s basic, and the README says so. Stronger fact-checking is still on the to-do list, along with a more personalized shuffle for active recall, integrations with tools like Notion, and a backend host with GPU access. There’s no automated testing pipeline yet either.
