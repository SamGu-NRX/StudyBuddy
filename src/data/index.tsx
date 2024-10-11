import { AIQuestionDifficulty, SaveQuestions, ProgressTracking, MobileFriendly, CustomizableStudyPlans } from "@/components/icons"
import {
  Bot,
  Save,
  Smartphone,
  Settings,
  ChartNoAxesCombined
} from "lucide-react"
import { FaDiscord, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';


  export const BentoItems = [
    {
      title: "AI-Generated Question Difficulties",
      description: "Adaptive AI assesses the difficulty level of each generated question, ensuring a balanced and effective study experience.",
      header: <AIQuestionDifficulty />,
      icon: <Bot className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Popup for Saving Questions",
      description: "Users can save questions to a shared database, contributing to a communal study resource.",
      header: <SaveQuestions />,
      icon: <Save className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Progress Tracking and Analytics",
      description: "See your study insights, track performance and study habits to learn more effectively and efficiently.",
      header: <ProgressTracking/>, //<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-analytics-image bg-cover"></div>,
      icon: <ChartNoAxesCombined className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Mobile-Friendly Design",
      description: "Ensures the platform is accessible and fully functional on mobile devices.",
      header: <MobileFriendly />,
      icon: <Smartphone className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Customizable Study Plans",
      description:
        "Allows users to create and follow personalized study plans based on their goals and schedules.",
      header: <CustomizableStudyPlans />,
      icon: <Settings className="h-4 w-4 text-neutral-500" />,
    },
  ];

  export const socialMedia = [
    { 
      id: 1,
      name: "GitHub", 
      link: "https://github.com/SamGu-NRX/studybuddy",
      icon:  <FaGithub className="h-6 w-6" />,
    },
    { 
      id: 2,
      name: "Twitter", 
      link: "https://twitter.com",
      icon:  <FaTwitter className="h-6 w-6" />,
    },
    { 
      id: 3,
      name: "LinkedIn", 
      link: "https://www.linkedin.com/company/studycoachai",
      icon:  <FaLinkedin className="h-6 w-6" />,
    },
    { 
      id: 4,
      name: "Discord", 
      link: "https://discord.gg",
      icon:  <FaDiscord className="h-6 w-6" />,
    },
  ];
  
  