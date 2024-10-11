import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Box, Image, Text, Stack, Link as ChakraLink } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

interface Card {
  imageUrl: string;
  title: string;
  description: string;
  href: string;
}

interface FeatureCardProps {
  card: Card;
  index: number;
  focusedIndex: number;
  setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}

const featureCards = [
  {
    title: "AI Chatbot Functionality",
    href: "/features/ai-chatbot",
    description: "The AI chatbot serves as a study companion, answering questions, providing explanations, and generating custom flashcards and MCQs on-demand.",
    imageUrl: "/images/ai-chatbot.jpg"
  },
  {
    title: "AI-Generated Question Difficulties",
    href: "/features/question-difficulties",
    description: "Adaptive AI assesses the difficulty level of each question, ensuring a balanced and effective study experience.",
    imageUrl: "/images/question-difficulties.jpg"
  },
  {
    title: "Popup for Saving Questions",
    href: "/features/save-questions",
    description: "Users can save questions to a shared database, contributing to a communal study resource.",
    imageUrl: "/images/save-questions.jpg"
  },
  {
    title: "Group Call Study Sessions",
    href: "/features/group-call",
    description: "Facilitates group study through video calls, enabling collaborative learning and discussion.",
    imageUrl: "/images/group-call.jpg"
  },
  {
    title: "User Interaction and Feedback",
    href: "/features/interaction-feedback",
    description: "Encourages active user participation and feedback to continuously improve the platform.",
    imageUrl: "/images/interaction-feedback.jpg"
  },
  {
    title: "Mobile-Friendly Design",
    href: "/features/mobile-friendly",
    description: "Ensures the platform is accessible and fully functional on mobile devices.",
    imageUrl: "/images/mobile-friendly.jpg"
  },
  {
    title: "Customizable Study Plans",
    href: "/features/study-plans",
    description: "Allows users to create and follow personalized study plans based on their goals and schedules.",
    imageUrl: "/images/study-plans.jpg"
  },
  {
    title: "Progress Tracking and Analytics",
    href: "/features/progress-tracking",
    description: "See your study insights, track performance and study habits to learn more effectively and efficiently.",
    imageUrl: "/images/progress-tracking.jpg"
  }
];

const FeatureCard = ({ card, index, focusedIndex, setFocusedIndex }: FeatureCardProps) => {
  const isFocused = index === focusedIndex;

  return (
    <motion.div
      className={`absolute w-[400px] h-[1000px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer ${
        isFocused ? 'z-10' : 'z-0'
      }`}
      layoutId={`card-${index}`}
      onClick={() => setFocusedIndex(index)}
      whileHover={{ scale: isFocused ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      animate={isFocused ? { x: 0, y: 0, scale: 1, rotate: 0 } : { x: (index - focusedIndex) * 40, y: (index - focusedIndex) * 20, scale: 0.8 }}
      style={{
        position: 'absolute',
        top: isFocused ? '50%' : `${50 + (index - focusedIndex) * 5}%`,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Image src={card.imageUrl} alt={card.title} width={400} height={300} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
        <p className="text-sm text-gray-600">{card.description}</p>
      </div>
      {isFocused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <a
            href={card.href}
            className="px-4 py-2 bg-slate-200 text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            Learn More
          </a>
        </motion.div>
      )}
    </motion.div>
  );
};

const FeatureCardsDeck = () => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const nextCard = () => {
    setFocusedIndex((prev) => (prev + 1) % featureCards.length);
  };

  const prevCard = () => {
    setFocusedIndex((prev) => (prev - 1 + featureCards.length) % featureCards.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 relative h-[600px]">
      <div className="relative overflow-hidden h-full">
        <div className="flex justify-center items-center gap-4 mb-4">
          <button onClick={prevCard} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <ChevronLeft size={24} />
          </button>
          <span className="text-lg font-bold">
            {focusedIndex + 1} / {featureCards.length}
          </span>
          <button onClick={nextCard} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {featureCards.map((card, index) => (
            <FeatureCard
              key={index}
              card={card}
              index={index}
              focusedIndex={focusedIndex}
              setFocusedIndex={setFocusedIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureCardsDeck;
