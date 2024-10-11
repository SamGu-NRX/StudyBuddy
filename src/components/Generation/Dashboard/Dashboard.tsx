import Head from 'next/head';
import Tutorial from '@/components/Onboarding/Tutorial';
import ClientOverlay from '@/components/Onboarding/ClientOverlay';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
} from 'lucide-react';

import Script from 'next/script'

import * as React from "react"

import Sidebar from "@/components/SidebarDash";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Question, columns } from "./columns"
import { DataTable } from "./data-table"

import Header from "@/components/HeaderDash"

import dataJson  from "@/app/dashboard.json" 

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import ProgressBars from '@/components/ProgressBar';

import StatCharts from '@/components/StatGraphs';

import { db } from "@/lib/db"


async function fetchFlashcards() {
  return await db.flashcards.findMany({
    select: {
      front: true,
      back: true,
    },
  });
}

async function getData(): Promise<Question[]> {
  let dataTableInfo = []
  for (let i = 0; i < dataJson['flashcard-sets'].length; i++){
    var correct = 0;
    const flashcardContent = dataJson['flashcard-sets'][i];
    for (let index = 0; index < flashcardContent.cards.length; index++){
      if (flashcardContent.cards[index].correct == flashcardContent.cards[index].chosen) correct++;
    }
    let flashcardJson = {
      title: flashcardContent.title,
      id: flashcardContent.ID,
      type: flashcardContent.subject,
      date: new Date(flashcardContent.date.year, flashcardContent.date.month-1, flashcardContent.date.day),
      accuracy: correct,
      "set-size": flashcardContent.cards.length
    }
    dataTableInfo.push(flashcardJson)
  }
  return dataTableInfo
}

 async function showQuestion() {
  return ("hi")
}

export default async function Dashboard() {
  const data = await getData()
  const todayDate = new Date(Date.now())
  const weekData = []
  const lastWeekData = []
  const monthData = []
  const yearData = []

  // useEffect(() => {
  //   async function fetchData() {
  //     const data = await getData();
  //     setData(data);
  //   }
  //   fetchData();
  // }, []);

  for (let i = 0; i < data.length; i++){
    if (data[i].date.getFullYear() == todayDate.getFullYear()){
      yearData.push(data[i])
      if (data[i].date.getMonth() == todayDate.getMonth()) {
        monthData.push(data[i])
        const sundayDate = todayDate.getDate() - todayDate.getDay();
        if (data[i].date.getDate() - sundayDate >= 0) weekData.push(data[i])
        else if (data[i].date.getDate() - sundayDate + 7 >= 0) lastWeekData.push(data[i])
      }
    }
  }

  function getAccuracy(data: Question[]){
    var correct = 0;
    var total = 0;
    for (let i = 0; i < data.length; i++){
      correct += data[i].accuracy;
      total += data[i]['set-size'];
    }
    return Math.round(correct/total * 100)
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ClientOverlay />
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Hello, Sam!</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Welcome back to StudyBuddy, your intelligent study
                    companion! Start improving your learning with AI today!
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button id="start-studying">Start Studying</Button>
                </CardFooter>
              </Card>
              <ProgressBars percent1={getAccuracy(weekData)} percent2={getAccuracy(monthData)}/>
            </div>
                <Card x-chunk="dashboard-05-chunk-3" id="questions">
                  <CardHeader className="px-7">
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>
                      Recent questions you answered this week.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <DataTable columns={columns} data={data} />
                  </CardContent>
                </Card>
          </div>
          <div>
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4" id="your-performance">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Weekly Performance
          </CardTitle>
          <CardDescription>See how you performed across flashcard sets from the past week.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <StatCharts weekData={weekData} lastWeekData={lastWeekData}/>
      </CardContent>
    </Card>
  </div>
        </main>
      </div>
    </div>
  );
}

// function setShowOverlay(arg0: boolean) {
//   throw new Error('Function not implemented.');
// }

