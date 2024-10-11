"use client";
import { useState, useEffect, useRef } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { fadeUp } from "@/animations/gsap";


export default function ProgressBars({ percent1, percent2 }: { percent1: number; percent2: number }) {
  const [progressWk, setProgressWk] = useState(13);
  const [progressMth, setProgressMth] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
      cardRefs.current.forEach((card, index) => {
          if (card) {
              fadeUp(card, card, { delay: index * 0.1 });
          }
      });
  }, []);

  useEffect(() => {
      const timerWk = setTimeout(() => setProgressWk(percent1), 600);
      return () => clearTimeout(timerWk);
  }, [percent1]);

  useEffect(() => {
      const timerMth = setTimeout(() => setProgressMth(percent2), 650);
      return () => clearTimeout(timerMth);
  }, [percent2]);

  return (
    <>
      <Card x-chunk="dashboard-05-chunk-1" id="this-week"
        ref={(el) => { if (el) { cardRefs.current[6] = el; }}}>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-4xl">{percent1}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              This week, you got {percent1}% questions right!
            </div>
          </CardContent>
          <CardFooter>
            <Progress value={progressWk} aria-label="90% correct" />
          </CardFooter>
      </Card>

      <Card x-chunk="dashboard-05-chunk-2" id="this-month" ref={(el) => { if (el) { cardRefs.current[7] = el; }}}>
        <CardHeader className="pb-2">
          <CardDescription>This Month</CardDescription>
          <CardTitle className="text-4xl">{percent2}%</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            This month, you got {percent2}% questions right.
          </div>
        </CardContent>
        <CardFooter>
          <Progress value={progressMth} aria-label="80% correct" />
        </CardFooter>
      </Card>
    </>
  )
}