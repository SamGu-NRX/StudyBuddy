"use server";

import dataJson from "@/app/dashboard.json";
import { Question, columns } from "./columns";
import { DataTable } from "./data-table";

export async function getData(): Promise<Question[]> {
  console.log("Fetching data...");
  let dataTableInfo = [];
  
  for (let i = 0; i < dataJson['flashcard-sets'].length; i++) {
    var correct = 0;
    const flashcardContent = dataJson['flashcard-sets'][i];
    
    for (let index = 0; index < flashcardContent.cards.length; index++) {
      if (flashcardContent.cards[index].correct === flashcardContent.cards[index].chosen) correct++;
    }
    
    let flashcardJson = {
      title: flashcardContent.title,
      id: flashcardContent.ID,
      type: flashcardContent.subject,
      date: new Date(flashcardContent.date.year, flashcardContent.date.month - 1, flashcardContent.date.day),
      accuracy: correct,
      "set-size": flashcardContent.cards.length
    };
    
    dataTableInfo.push(flashcardJson);
  }
  
  console.log("Data fetched:", dataTableInfo);

  return dataTableInfo;
}

export async function fetchTable() {
  const data = await getData();
  console.log("Fetched Data:", data);
  return (
    <DataTable columns={columns} data={data} />
  );
}

export const data = await getData();
export const todayDate = new Date(Date.now());
export const weekData = [];
export const lastWeekData = [];
export const monthData = [];
export const yearData = [];