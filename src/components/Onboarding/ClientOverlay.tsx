"use client";
import { useState } from 'react';
import Overlay from './Overlay';
import Tutorial from './Tutorial';

const ClientOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleOverlayClose = () => {
    setShowOverlay(false);
    setShowTutorial(true);
  };

  const handleOverlaySave = (educationLevel: string, selectedSubjects: string[], notes: string, syllabus: string) => {
    console.log('Education level:', educationLevel);
    console.log('Selected subjects:', selectedSubjects);
    console.log('Notes:', notes);
    console.log('Syllabus:', syllabus);
    setShowOverlay(false);
    setShowTutorial(true);
  };

  if (showOverlay) {
    return <Overlay onClose={handleOverlayClose} onSave={handleOverlaySave} />;
  }

  if (showTutorial) {
    return <Tutorial onClose={() => setShowTutorial(false)} />;
  }

  return null;
};

export default ClientOverlay;