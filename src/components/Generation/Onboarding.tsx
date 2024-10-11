'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { FormDataSchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import FileUpload from './FileUpload';
import GradeLevelSelection from './GradeLevelSelection';
import { SubjectSelection } from './SubjectSelection';
import Confetti from 'react-confetti';

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  { id: 'Step 1', name: 'Basic Information', fields: ['gradeLevel', 'subject'] },
  { id: 'Step 2', name: 'Upload Documents & Notes', fields: ['uploadedNotes'] },
  { id: 'Step 3', name: 'Upload Syllabus & Context', fields: ['uploadedSyllabus'] },
  { id: 'Step 4', name: 'Complete' },
];

const gradeLevels = ['Elementary', 'Middle School', 'High School', 'College'];

export default function Onboarding() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  const methods = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      gradeLevel: '',
      subject: '',
      uploadedNotes: '',
      uploadedSyllabus: '',
    },
  });

  const { register, handleSubmit, setValue, watch, reset, trigger, formState } = methods;
  const { errors } = formState;

  // Load data from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('onboardingData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        reset(parsedData); // Use reset to set all form values
      }

      const savedStep = localStorage.getItem('onboardingStep');
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    }
  }, [reset]);

  // Save data to localStorage whenever form data changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('onboardingData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Form submission handler
  const processForm: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('onboardingStep');
    reset();
  };

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

      {/* Step Navigation */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-sky-600 transition'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className='flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                  aria-current='step'
                >
                  <span className='text-sm font-medium text-sky-600'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : (
                <div className='group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-gray-500 transition'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className='mt-12 py-12' onSubmit={handleSubmit(processForm)}>
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className='text-xl font-semibold leading-7 text-gray-900'>
              Educational Information
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
              Please provide your educational details and upload any relevant documents.
            </p>

            <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 justify-center items-center'>
              <div className='sm:col-span-3'>
                <GradeLevelSelection
                  gradeLevels={gradeLevels}
                  onSelect={(e) => {
                    const value = e.target.value;
                    setValue('gradeLevel', value);
                    saveToLocalStorage({ gradeLevel: value });
                  }}
                />
                {errors.gradeLevel?.message && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.gradeLevel.message}
                  </p>
                )}
              </div>

              <div className='sm:col-span-3 flex flex-col pt-[36px]'>
                <SubjectSelection
                  onSubjectSelect={(subject) => {
                    setValue('subject', subject?.value || '');
                    saveToLocalStorage({ subject: subject?.value || '' });
                  }}
                />
                {errors.subject?.message && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.subject.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FileUpload
              label="Upload Document"
              title={`Upload your ${selectedSubject || 'selected subject'} notes here`}
              fileData={fileData}
              onFileAccepted={(content) => {
                setValue('uploadedText', content);
                saveToLocalStorage({ uploadedText: content });
                setFileData(content);
              }}
            />
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FileUpload
              label="Upload Document"
              title={`Upload your ${selectedSubject || 'selected subject'} syllabus/grading context here`}
              fileData={fileData}
              onFileAccepted={(content) => {
                setValue('uploadedText', content);
                saveToLocalStorage({ uploadedText: content });
                setFileData(content);
              }}
            />
          </motion.div>
        )}

        {currentStep === 3 && (
          <>
            <h2 className='text-base font-semibold leading-7 text-gray-900'>
              Complete
            </h2>
            <p className='mt-1 text-sm leading-6 text-gray-600'>
              Thank you for your submission.
            </p>
          </>
        )}
      </form>

      {/* Navigation Buttons */}
      <div className='mt-8 pt-5'>
        <div className='flex justify-between'>
          <button
            type='button'
            onClick={prev}
            disabled={currentStep === 0}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 transition'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />
            </svg>
          </button>
          <button
            type='button'
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 transition disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.25 4.5l7.5 7.5-7.5 7.5'
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}