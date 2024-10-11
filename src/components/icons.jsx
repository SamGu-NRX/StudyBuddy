import React from 'react';
import { Bot, Save, ChartNoAxesCombined, Smartphone, Settings } from 'lucide-react';
import { IconContext } from "react-icons";
import { FaDiscord, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

export const AIQuestionDifficulty = () => (
  <div className="w-full h-32 bg-blue-100 rounded-xl flex items-center justify-center p-4">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" fill="#3B82F6" opacity="0.2" />
      <circle cx="50" cy="50" r="32" fill="#3B82F6" opacity="0.4" />
      <circle cx="50" cy="50" r="22" fill="#3B82F6" opacity="0.6" />
      <Bot className="text-blue-600" size={40} x="30" y="30" />
    </svg>
  </div>
);

export const SaveQuestions = () => (
  <div className="w-full h-32 bg-green-100 rounded-xl flex items-center justify-center p-4">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="60" fill="#10B981" opacity="0.2" rx={5}/>
      <rect x="30" y="30" width="40" height="40" fill="#10B981" opacity="0.4" rx={5}/>
      <Save className="text-green-600" size={40} x="30" y="30" />
    </svg>
  </div>
);

export const ProgressTracking = () => (
  <div className="w-full h-32 bg-purple-100 rounded-xl flex items-center justify-center p-4">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <rect x="10" y="40" width="20" height="50" fill="#8B5CF6" opacity="0.4" />
      <rect x="40" y="20" width="20" height="70" fill="#8B5CF6" opacity="0.6" />
      <rect x="70" y="10" width="20" height="80" fill="#8B5CF6" opacity="0.8" />
      <ChartNoAxesCombined className="text-purple-600" size={40} x="30" y="30" />
    </svg>
  </div>
);

export const MobileFriendly = () => (
  <div className="w-full h-32 bg-yellow-100 rounded-xl flex items-center justify-center p-4">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <rect x="28" y="10" width="44" height="80" rx="5" fill="#FBBF24" opacity="0.2" />
      <rect x="33" y="15" width="34" height="70" rx="3" fill="#FBBF24" opacity="0.35" />
      <Smartphone className="text-yellow-600" size={40} x="30" y="30" />
    </svg>
  </div>
);

export const CustomizableStudyPlans = () => (
  <div className="w-full h-32 bg-red-100 rounded-xl flex items-center justify-center p-4">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#EF4444" opacity="0.2" />
      <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="#EF4444" opacity="0.4" />
      <Settings className="text-red-600" size={40} x="30" y="30" />
    </svg>
  </div>
);

// const BentoItemVisuals = () => {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
//       <AIQuestionDifficulty />
//       <SaveQuestions />
//       <ProgressTracking />
//       <MobileFriendly />
//       <CustomizableStudyPlans />
//     </div>
//   );
// };
