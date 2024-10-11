"use client"
import Sidebar from "@/components/SidebarDash"
import Header from "@/components/HeaderDash"

import Link from "next/link"

import dataJson from "@/app/dashboard.json"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

  import { Input } from "@/components/ui/input"
  import { Button } from "@/components/ui/button"

  import { useSearchParams } from 'next/navigation'

import * as React from "react"

import FlashcardDrawer from "@/components/FlashcardDisplay"

export default function ReviewPage(){
    const [id, setId] = React.useState("");

    const searchParams = useSearchParams();

    const idpresent = searchParams.has("id");
    const cardId = searchParams.get("id");
    let flagFlashcards = false;
    let flashcardSet = {};

    if (idpresent){
        for (let i = 0; i < dataJson["flashcard-sets"].length; i++){
            if (cardId == dataJson["flashcard-sets"][i].ID){
                flashcardSet = dataJson["flashcard-sets"][i];
                flagFlashcards = true;
                break;
            }
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Sidebar/>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header/>
          </div>
            <div className="flex items-center justify-center space-x-2 py-20">
            { flagFlashcards ? 
            <Card className="max-w-xl">
            <CardHeader className="pb-3">
                  <CardTitle className="justify-center">{flashcardSet.title}</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Subject: {flashcardSet.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <FlashcardDrawer cardID = {cardId}/>
                </CardContent>
                <CardFooter>
                    <Link href={"/dashboard-force/"}><Button>Finish</Button></Link>
                </CardFooter>
            </Card> 
            : 
            <Card className="sm:col-span-2 items-center justify-center">
            <CardHeader className="pb-3">
                  <CardTitle className="justify-center">Start reviewing flashcards</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    See what you got right and wrong in your flashcard sets.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <Input onChange = {e => setId(e.target.value)} placeholder="Flashcard Set ID" required/>
                    { idpresent ? <span className="text-[#FF0000]">Invalid Flashcard Set</span> : null}
                </CardContent>
                <CardFooter>
                    <Link href={"/dashboard-force/review?id=".concat("", id)}><Button>Open Flashcard Set</Button></Link>
                </CardFooter>
            </Card>}
            </div>
        </div>
    )
}