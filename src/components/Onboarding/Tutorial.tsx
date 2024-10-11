"use client";
import React from 'react';
import IntroJs from 'intro.js';
import 'intro.js/minified/introjs.min.css';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
    React.useEffect(() => {
    const intro = IntroJs();
    intro.setOptions({
      steps: [
        {
          title: 'Welcome to StudyBuddy!',
          intro: 'Want to take a look around?',
        //   buttons: [
        //     {
        //       text: 'No',
        //       class: 'introjs-skipbutton',
        //       action: function() {
        //         intro.exit();
        //       }
        //     },
        //     {
        //       text: 'Yes',
        //       class: 'introjs-nextbutton',
        //       action: function() {
        //         // Here you can start your actual tutorial
        //         // For example:
        //         // startTutorial();
        //         intro.nextStep();
        //       }
        //     }
        //   ]
        },
        {
          element: '#this-week',
          intro: 'This is where your weekly statistics are located',
        },
        {
          element: '#this-month', 
          intro: 'This is where your monthly statistics are located',
        },
        {
          element: '#your-performance',
          intro: 'This is where your performance statistics are located',
        },
        {
          element: '#questions',
          intro: 'Check out your recently answered questions here!',
        },
        {
          element: '#settings',
          intro: 'Change your settings here!',
        },
        {
          element: '#upgrade',
          intro: 'Upgrade your study plan here!',
        },
        // {
        //   element: '#stats',
        //   intro: 'View your stats in depth here!',
        // },
        {
          element: '#review',
          intro: 'Review your flashcard sets here!',
        },
        {
          element: '#dashboard',
          intro: 'Click here to return to the dashboard!',
        },
        {
          element: '#start-studying',
          intro: 'Begin your study journey here!',
        }
      ]
    });
    intro.start();
  }, []);

  return null;
};
export default Tutorial;