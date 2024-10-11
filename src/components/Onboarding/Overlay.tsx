"use client";
import { useState, useEffect } from 'react';
import styles from './Overlay.module.css';
import OCR from '../OCR/OCR';  // Assuming you'll place the OCR component in the same directory

interface OverlayProps {
  onClose: () => void;
  onSave: (educationLevel: string, selectedSubjects: string[], notes: string, syllabus: string) => void;
}

const Overlay: React.FC<OverlayProps> = ({ onClose, onSave }) => {
  const [educationLevel, setEducationLevel] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [syllabus, setSyllabus] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'education' | 'subjects' | 'notes' | 'syllabus'>('education');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((sub) => sub !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = () => {
    localStorage.setItem('educationLevel', educationLevel);
    localStorage.setItem('knownSubjects', JSON.stringify(selectedSubjects));
    localStorage.setItem('notes', notes);
    localStorage.setItem('syllabus', syllabus);
    onSave(educationLevel, selectedSubjects, notes, syllabus);
    onClose();
  };

  const educationLevels = ['Elementary School', 'Middle School', 'High School', 'Undergraduate', 'Graduate', 'Doctoral', 'Other'];
  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Spanish', 'Art', 'Music', 'Chemistry', 'Biology', 'Psychology', 'Computer Science', 'Environmental Science'];

  return (
    <div className={styles.overlay}>
      <div className={`${styles.content}`}>
        {currentStep === 'education' && (
          <>
            <h2>What is your current level of education?</h2>
            <div className={`${styles.options}`}>
              {educationLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setEducationLevel(level)}
                  className={`${styles.optionButton} ${educationLevel === level ? styles.selected : ''}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button className={styles.continueButton} onClick={() => setCurrentStep('subjects')}>Continue</button>
          </>
        )}
        {currentStep === 'subjects' && (
          <>
            <h2>Which of the following subjects do you want to study?</h2>
            <div className={`${styles.options}`}>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubject(sub)}
                  className={`${styles.optionButton} ${selectedSubjects.includes(sub) ? styles.selected : ''}`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <button className={styles.continueButton} onClick={() => setCurrentStep('notes')}>Continue</button>
          </>
        )}
        {currentStep === 'notes' && (
          <>
            <h2>Upload your notes (optional)</h2>
            <OCR onOcrComplete={(text) => setNotes(text)} />
            <button className={styles.continueButton} onClick={() => setCurrentStep('syllabus')}>Continue</button>
          </>
        )}
        {currentStep === 'syllabus' && (
          <>
            <h2>Upload your syllabus (optional)</h2>
            <OCR onOcrComplete={(text) => setSyllabus(text)} />
            <button className={styles.continueButton} onClick={handleSave}>Finish</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Overlay;