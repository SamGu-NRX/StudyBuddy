"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "../ui/hero-highlight";
import { AIQuestionDifficulty, SaveQuestions, ProgressTracking, MobileFriendly, CustomizableStudyPlans } from "@/components/icons"
import {
  Bot,
  Save,
  Smartphone,
  Settings,
  ChartNoAxesCombined
} from "lucide-react"
import Image from "next/image"
import { fadeUp } from "@/animations/gsap";
import { BentoItems } from "@/data";
// import statsImage from "@/assets/analytics.png"

 const HomeGrid =() => {

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      fadeUp(card, card, { delay: index * 0.1 });
    });
  }, []);

    return (
      <div className="my-8">
        <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 py-10"
      >
        <div className="text-3xl md:text-5xl font-bold dark:text-white text-center">
          Features
        </div>
        <div className="text-center font-light text-base md:text-xl dark:text-neutral-200 py-4 max-w-3xl">
          StudyBuddy offers a variety of functionalities that allow efficient studying for students and an automated process of generating study flashcards.   
        </div>
      </motion.div>

      <BentoGrid className="max-w-5xl mx-auto -mt-3">
        {BentoItems.map((item, index) => (
          <div key={item.title}   
          ref={el => { if (el) cardRefs.current[index] = el; }} className={index === 4? "md:col-span-2 " : ""}>
            <BentoGridItem
              key={index}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
            />
          </div>
        ))}
      </BentoGrid>

      </div>
    );
  }
  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
  );
  

export default HomeGrid;