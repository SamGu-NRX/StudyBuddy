import { useState, useEffect } from 'react';
import Overlay from './Overlay';

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(true);

  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  const handleOverlaySave = (selectedSubjects: any) => {
    console.log('Selected Subjects:', selectedSubjects);
  };

  useEffect(() => {
    // Automatically show the overlay when the page loads
    setShowOverlay(true);
  }, []);

  return (
    <div>
      {showOverlay && <Overlay onClose={handleOverlayClose} onSave={handleOverlaySave} />}
    </div>
  );
}