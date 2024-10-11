import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader, Clock } from "lucide-react";
import { gsap } from "gsap";
import confetti from 'canvas-confetti';
import { generate_mcq } from "@/actions/get-AI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const MCQGenerator = () => {
  const [mcqQuestions, setMCQQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);

  const questionRef = useRef(null);

  const handleGenerateMCQ = async () => {
    setIsLoading(true);
    try {
      const newMCQQuestions = await generate_mcq(context);
      setMCQQuestions(newMCQQuestions);
      setCurrentIndex(0);
      setScore(0);
      localStorage.setItem("mcqQuestions", JSON.stringify(newMCQQuestions));
      localStorage.setItem("currentIndex", "0");
      setIsTimerRunning(true);
    } catch (error) {
      console.error("Error generating MCQ questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = useCallback(() => {
    setIsTimerRunning(false);
    setShowFeedback(true);
    if (selectedAnswer === mcqQuestions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  }, [selectedAnswer, currentIndex, mcqQuestions, score]);
  
  useEffect(() => {
    const savedMCQQuestions = localStorage.getItem("mcqQuestions");
    const savedIndex = localStorage.getItem("currentIndex");
    if (savedMCQQuestions) {
      try {
        setMCQQuestions(JSON.parse(savedMCQQuestions));
      } catch (error) {
        console.error("Error parsing MCQ questions from localStorage:", error);
        localStorage.removeItem("mcqQuestions");
      }
    }
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10));
    }
  }, []);

  useEffect(() => {
    if (mcqQuestions) {
      localStorage.setItem("mcqQuestions", JSON.stringify(mcqQuestions));
      localStorage.setItem("currentIndex", currentIndex.toString());
    }
  }, [mcqQuestions, currentIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [handleSubmit, isTimerRunning, timeLeft]);

  const nextQuestion = () => {
    if (mcqQuestions && currentIndex < mcqQuestions.length - 1) {
      gsap.to(questionRef.current, {
        duration: 0.4,
        x: -300,
        opacity: 0,
        ease: "power3.Out",
        onComplete: () => {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer("");
          setShowFeedback(false);
          setTimeLeft(30);
          gsap.fromTo(
            questionRef.current,
            { x: 300, opacity: 0 },
            { duration: 0.45, x: 0, opacity: 1, ease: "power3.out" }
          );
        },
      });
    } else if (mcqQuestions && currentIndex === mcqQuestions.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const prevQuestion = () => {
    if (mcqQuestions && currentIndex > 0) {
      gsap.to(questionRef.current, {
        duration: 0.4,
        x: 300,
        opacity: 0,
        ease: "power3.Out",
        onComplete: () => {
          setCurrentIndex(currentIndex - 1);
          setSelectedAnswer("");
          setShowFeedback(false);
          setTimeLeft(30);
          gsap.fromTo(
            questionRef.current,
            { x: -300, opacity: 0 },
            { duration: 0.45, x: 0, opacity: 1, ease: "power3.out" }
          );
        },
      });
    }
  };

  

  const progress = mcqQuestions && mcqQuestions.length > 0 ? ((currentIndex + 1) / mcqQuestions.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">MCQ Generator</h1>

      <div className="w-full max-w-md mb-8 space-y-4">
        <Input
          placeholder="Add context to generate MCQ questions"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isLoading}
        />
        <Button
          className="w-full"
          onClick={handleGenerateMCQ}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              <span>Generating MCQ questions... (Est. 15s)</span>
            </div>
          ) : (
            "Generate MCQ Questions"
          )}
        </Button>
      </div>

      {mcqQuestions && mcqQuestions.length > 0 ? (
        <Progress value={progress} className="w-full max-w-md mb-4" />
      ) : (
        <p>No MCQ questions available</p>
      )}

      {mcqQuestions && mcqQuestions.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            ref={questionRef}
            className="w-full max-w-md"
          >
            <Card className="w-full mb-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{mcqQuestions[currentIndex].question}</h2>
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  {mcqQuestions[currentIndex].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
              <Button onClick={handleSubmit} disabled={!selectedAnswer || showFeedback}>
                Submit Answer
              </Button>
              <div className="flex items-center">
                <Clock className="mr-2" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {showFeedback && (
              <Alert variant={selectedAnswer === mcqQuestions[currentIndex].correctAnswer ? "default" : "destructive"}>
                <AlertTitle>
                  {selectedAnswer === mcqQuestions[currentIndex].correctAnswer ? "Correct!" : "Incorrect"}
                </AlertTitle>
                <AlertDescription>
                  {selectedAnswer === mcqQuestions[currentIndex].correctAnswer
                    ? "Great job! You got it right."
                    : `The correct answer is: ${mcqQuestions[currentIndex].correctAnswer}`}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex justify-between items-center w-full max-w-md mt-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
        </motion.button>

        <div className="text-lg">
          {mcqQuestions && mcqQuestions.length > 0 ? currentIndex + 1 : 0} / {mcqQuestions ? mcqQuestions.length : 0}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          onClick={nextQuestion}
          disabled={mcqQuestions && currentIndex === mcqQuestions.length - 1}
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {mcqQuestions && mcqQuestions.length > 0 && (
        <div className="mt-4 text-lg font-semibold">
          Score: {score} / {mcqQuestions.length}
        </div>
      )}
    </div>
  );
};

export default MCQGenerator;