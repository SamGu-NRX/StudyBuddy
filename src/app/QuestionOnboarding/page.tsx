// src/app/onboarding/page.tsx
"use client";

import { useState } from 'react';
import Onboarding from '@/components/Generation/Onboarding';
// import SubjectSelection from '@/components/Generation/SubjectSelection';
// import GradeLevelSelection from '@/components/Generation/GradeLevelSelection';
// import FileUpload from '@/components/Generation/FileUpload';

// const Onboarding = () => {
//   const [selectedSubject, setSelectedSubject] = useState(null);
//   const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
//   const [syllabusContent, setSyllabusContent] = useState('');
//   const [notesContent, setNotesContent] = useState('');

//   const subjects = [
//     { id: 1, name: 'Mathematics' },
//     { id: 2, name: 'Science' },
//     { id: 3, name: 'History' },
//     // Add more subjects
//   ];

//   const gradeLevels = [
//     'High School',
//     'University',
//     'Other',
//   ];

//   const handleSubjectSelect = (subject) => {
//     setSelectedSubject(subject);
//   };

//   const handleGradeLevelSelect = (event) => {
//     setSelectedGradeLevel(event.target.value);
//   };

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-3xl font-bold mb-8">Onboarding</h1>
//       <SubjectSelection subjects={subjects} onSelect={handleSubjectSelect} />
//       <GradeLevelSelection gradeLevels={gradeLevels} onSelect={handleGradeLevelSelect} />
//       <FileUpload label="Upload Syllabus (Optional)" onFileAccepted={setSyllabusContent} />
//       <FileUpload label="Upload Notes (Optional)" onFileAccepted={setNotesContent} />

//       <div className="mt-8">
//         <h2 className="text-2xl font-semibold mb-4">Summary</h2>
//         <p><strong>Selected Subject:</strong> {selectedSubject}</p>
//         <p><strong>Selected Grade Level:</strong> {selectedGradeLevel}</p>
//         <p><strong>Syllabus Content:</strong> {syllabusContent}</p>
//         <p><strong>Notes Content:</strong> {notesContent}</p>
//         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
//           Complete Onboarding
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Onboarding;

export default function App() {
  return(
    <Onboarding />
  )
}