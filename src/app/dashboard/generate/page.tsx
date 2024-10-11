"use client";
import FlashcardApp from "@/components/Generation/Dashboard/Flashcards";
import Sidebar from "@/components/SidebarDash";
import Header from "@/components/HeaderDash";
import { fadeUp } from "@/animations/gsap";
import { useEffect, useRef } from "react";

const GenerateFlashcards = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLHeadingElement | HTMLParagraphElement | HTMLButtonElement)[]>([]);

  useEffect(() => {
    if (dashboardRef.current) {
      fadeUp(elementsRef.current.filter(el => el !== null) as HTMLElement[], dashboardRef.current, { delay: 0.05, start: 'top 80%', ease: 'power3.inOut', stagger: 0.1 });
    }
  }, []);
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
    <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main
          className="gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"
          ref={dashboardRef}
        >
          <FlashcardApp />
        </main>
      </div>
    </div>
  )
}

export default GenerateFlashcards