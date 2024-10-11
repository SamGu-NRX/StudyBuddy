"use client";

import Head from 'next/head';
import Tutorial from '@/components/Onboarding/Tutorial';
import ClientOverlay from '@/components/Onboarding/ClientOverlay';
import { ChevronLeft, ChevronRight, Copy, MoreVertical } from 'lucide-react';
import Script from 'next/script';
import React, { useRef, useEffect, useState } from "react";
import Sidebar from "@/components/SidebarDash";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Question, columns } from "./columns";
import { DataTable } from "./data-table";
import Header from "@/components/HeaderDash";
import { data, fetchTable as QuestionTable, todayDate, weekData, lastWeekData, monthData, yearData } from './getData';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import ProgressBars from '@/components/ProgressBar';
import StatCharts from '@/components/StatGraphs';
import { fadeUp } from '@/animations/gsap';
import { Table } from '@/components/ui/table';

function getAccuracy(data: Question[]) {
  if (!data || data.length === 0) {
    return 90;
  }
  
  var correct = 0;
  var total = 0;
  for (let i = 0; i < data.length; i++) {
    correct += data[i].accuracy;
    total += data[i]['set-size'];
  }
  return Math.round((correct / total) * 100);
}

interface DashboardProps {
  todayDate: Date;
  weekData: Question[];
  lastWeekData: Question[];
  monthData: Question[];
  yearData: Question[];
}

const Dashboard: React.FC<DashboardProps>= () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLHeadingElement | HTMLParagraphElement | HTMLButtonElement)[]>([]);
  
  const [loading, setLoading] = useState(true);

  

  const redirectGenerate = () => {
    window.location.href = '/dashboard-force/flashcards';
  }


  useEffect(() => {
      if (dashboardRef.current) {
        fadeUp(elementsRef.current.filter(el => el !== null) as HTMLElement[], dashboardRef.current, { delay: 0.05, start: 'top 80%', ease: 'power3.inOut', stagger: 0.1 });
      }
    }, []);
   


  if (data && Array.isArray(data) && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].date.getFullYear() == todayDate.getFullYear()) {
        yearData.push(data[i]);
        if (data[i].date.getMonth() == todayDate.getMonth()) {
          monthData.push(data[i]);
          const sundayDate = todayDate.getDate() - todayDate.getDay();
          if (data[i].date.getDate() - sundayDate >= 0) weekData.push(data[i]);
          else if (data[i].date.getDate() - sundayDate + 7 >= 0) lastWeekData.push(data[i]);
        }
      }
    }
  }

  console.log(data)


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <ClientOverlay />
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main
          className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3"
          ref={dashboardRef}
        >
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card
                className="sm:col-span-2"
                x-chunk="dashboard-05-chunk-0"
                ref={(el) => {
                  if (el) elementsRef.current[1] = el;
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle>Hello, Sam!</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Welcome back to StudyBuddy, your intelligent study companion! Start improving your learning with AI today!
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button id="start-studying" onClick={redirectGenerate}>
                    Start Studying</Button>
                </CardFooter>
              </Card>
              <ProgressBars
                percent1={getAccuracy(weekData)}
                percent2={getAccuracy(monthData)}
                ref={(el: HTMLHeadingElement | HTMLParagraphElement | HTMLButtonElement) => {
                  if (el) elementsRef.current[2] = el;
                }}
              />
            </div>
            <Card
            x-chunk="dashboard-05-chunk-3"
            id="questions"
            ref={(el) => {
            if (el) elementsRef.current[3] = el;
            }}
            >
              <CardHeader className="px-7">
                <CardTitle>Questions</CardTitle>
                  <CardDescription>Recent questions you answered this week.</CardDescription>
              </CardHeader>
              <CardContent>
                {Array.isArray(data) && data.length > 0 ? (
                <QuestionTable />
                ) : (
                <div>You haven&apos;t answered any questions today! Go practice!</div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4" id="your-performance">
              <CardHeader className="flex flex-row items-start bg-muted/50" ref={(el) => { if (el) elementsRef.current[4] = el; }}>
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
              <CardContent className="p-6 text-sm" ref={(el) => { if (el) elementsRef.current[5] = el; }}>
                <StatCharts weekData={weekData} lastWeekData={lastWeekData} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;