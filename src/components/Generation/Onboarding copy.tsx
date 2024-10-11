'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { FormDataSchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import FileUpload from './FileUpload';
import GradeLevelSelection from './GradeLevelSelection';
import { SubjectSelection } from './SubjectSelection';
import Confetti from 'react-confetti';

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['gradeLevel', 'subject'] },
  { id: 'Step 2', name: 'Upload Documents & Notes', fields: ['uploadedText'] },
  { id: 'Step 3', name: 'Upload Syllabus & Context', fields: ['uploadedText'] },
  { id: 'Step 4', name: 'Complete' }
];

const gradeLevels = ['Elementary', 'Middle School', 'High School', 'College'];

export default function Onboarding() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileData, setFileData] = useState<string | null>(null);
  const delta = currentStep - previousStep;

  // Initialize useForm with zod validation and react-hook-form resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      gradeLevel: '',   // Set default form values
      subject: '',
      uploadedText: ''
    }
  });

  // Watch specific form fields to track changes
  const selectedSubject = watch('subject');

  // Load data from localStorage when the component is mounted
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this only runs on client-side
      const savedData = localStorage.getItem('onboardingData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach((key) => {
          setValue(key as keyof Inputs, parsedData[key]);  // Set form data from localStorage
        });
        if (parsedData.uploadedText) {
          setFileData(parsedData.uploadedText); // Set fileData for FileUpload component
        }
      }

      const savedStep = localStorage.getItem('onboardingStep');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }
  }, [setValue]);

  // Save form data to localStorage when changes occur
  const saveToLocalStorage = (data: Partial<Inputs>) => {
    const existingData = localStorage.getItem('onboardingData');
    const newData = existingData ? { ...JSON.parse(existingData), ...data } : data;
    localStorage.setItem('onboardingData', JSON.stringify(newData));
  };

  // Watch for form field changes and trigger localStorage save
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name) {
        saveToLocalStorage({ [name]: value[name as keyof Inputs] });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Form submission handler
  const processForm: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    // Clear localStorage and reset form upon successful submission
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('onboardingStep');
    reset();
  };

  // Handle navigation to the next step
  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as (keyof Inputs)[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep((prevStep) => {
        const newStep = prevStep + 1;
        localStorage.setItem('onboardingStep', newStep.toString());
        return newStep;
      });

      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)(); // Submit on the final step
      }
    }
  };

  // Handle navigation to the previous step
  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((prevStep) => {
        const newStep = prevStep - 1;
        localStorage.setItem('onboardingStep', newStep.toString());
        return newStep;
      });
    }
  };

  // Render the form and steps
  return (
    <section className='absolute inset-0 flex flex-col justify-between p-24 backdrop-blur-xl'>
      {currentStep === steps.length - 1 && <Confetti />}
      {/* Steps */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              <div className={currentStep > index ? 'group border-sky-600' : 'group border-gray-200'}>
                <span>{step.id}</span>
                <span>{step.name}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Form steps */}
      <form className='mt-12 py-12' onSubmit={handleSubmit(processForm)}>
        {currentStep === 0 && (
          <motion.div initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <GradeLevelSelection onSelect={(e) => { setValue('gradeLevel', e.target.value); saveToLocalStorage({ gradeLevel: e.target.value }); } } gradeLevels={[]} />
            <SubjectSelection onSubjectSelect={(subject) => { setValue('subject', subject?.value || ''); saveToLocalStorage({ subject: subject?.value || '' }); }} />
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <FileUpload label="Upload Document" title={`Upload your ${selectedSubject || 'selected subject'} notes here`} fileData={fileData} onFileAccepted={(content) => { setValue('uploadedText', content); saveToLocalStorage({ uploadedText: content }); setFileData(content); }} />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <FileUpload label="Upload Document" title={`Upload your ${selectedSubject || 'selected subject'} syllabus/grading context here`} fileData={fileData} onFileAccepted={(content) => { setValue('uploadedText', content); saveToLocalStorage({ uploadedText: content }); setFileData(content); }} />
          </motion.div>
        )}

        {currentStep === 3 && (
          <>
            <h2>Complete</h2>
            <p>Thank you for your submission.</p>
          </>
        )}
      </form>

      {/* Navigation buttons */}
      <div className='mt-8 pt-5'>
        <div className='flex justify-between'>
          <button type='button' onClick={prev} disabled={currentStep === 0} className='disabled:opacity-50'>Prev</button>
          <button type='button' onClick={next} disabled={currentStep === steps.length - 1} className='disabled:opacity-50'>Next</button>
        </div>
      </div>
    </section>
  );
}
