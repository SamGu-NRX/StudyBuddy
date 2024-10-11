'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { FormDataSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import FileUpload from './FileUpload'
import GradeLevelSelection from './GradeLevelSelection'
import { SubjectSelection } from './SubjectSelection'
import OCR from '@/components/OCR/OCR'

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Step 1',
    name: 'Basic Information',
    fields: ['gradeLevel', 'subject']
  },
  {
    id: 'Step 2',
    name: 'Upload Documents & Notes',
    fields: ['uploadedText']
  },
  {
    id: 'Step 3',
    name: 'Upload Syllabus & Context',
    fields: ['uploadedText']
  },
  { id: 'Step 4', name: 'Complete' }
]

const gradeLevels = ['Elementary', 'Middle School', 'High School', 'College']

export default function Onboarding() {
  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fileData, setFileData] = useState<string | null>(null)
  const delta = currentStep - previousStep

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema)
  })

  // Load data from local storage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      Object.keys(parsedData).forEach((key) => {
        setValue(key as keyof Inputs, parsedData[key])
      })
    }
    
    const savedFileData = localStorage.getItem('onboardingFileData')
    if (savedFileData) {
        setFileData(savedFileData)
    }

    const savedStep = localStorage.getItem('onboardingStep')
    if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10))
    }
  }, [setValue])
    
      // Save data to local storage after each field change
    const saveToLocalStorage = (data: Partial<Inputs>) => {
        const existingData = localStorage.getItem('onboardingData')
        const newData = existingData ? { ...JSON.parse(existingData), ...data } : data
        localStorage.setItem('onboardingData', JSON.stringify(newData))
    }
    
      // Watch for changes in form fields and save to local storage
    useEffect(() => {
      const subscription = watch((value, { name }) => {
        if (name) {
            saveToLocalStorage({ [name]: value[name as keyof Inputs] })
        }
      })
      return () => subscription.unsubscribe()
    }, [watch])
    
    const processForm: SubmitHandler<Inputs> = data => {
      console.log(data)
      // Clear local storage after successful form submission
      localStorage.removeItem('onboardingData')
      localStorage.removeItem('onboardingFileData')
      localStorage.removeItem('onboardingStep')
      reset()
    }

  type FieldName = keyof Inputs

  const next = async () => {
    const fields = steps[currentStep].fields
    const output = await trigger(fields as FieldName[], { shouldFocus: true })

    if (!output) return

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)()
      } else {
        const newStep = currentStep + 1
        setCurrentStep(newStep)
        setPreviousStep(currentStep)
        localStorage.setItem('onboardingStep', newStep.toString())
      }
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      setPreviousStep(currentStep)
      localStorage.setItem('onboardingStep', newStep.toString())
    }
  }

  const handleGradeLevelSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setValue('gradeLevel', value)
    saveToLocalStorage({ gradeLevel: value })
  }

  const handleSubjectSelect = (subject: Subject | null) => {
    setValue('subject', subject?.value || '')
    saveToLocalStorage({ subject })
  }

  const handleFileAccepted = (ocrContent: string) => {
    setFileData(ocrContent)
  }

  const handleOcrTextEdit = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const editedText = event.target.value
    setValue('uploadedText', editedText)
    saveToLocalStorage({ uploadedText: editedText })
    setFileData(editedText)
    localStorage.setItem('onboardingFileData', editedText)
  }
  const openNotesStep = () => {
    setCurrentStep('notes')
  }

  const openSyllabusStep = () => {
    setCurrentStep('syllabus')
  }

  return (
    <section className='absolute inset-0 flex flex-col justify-between p-24 backdrop-blur-xl'>
      {/* steps */}
      <nav aria-label='Progress'>
        <ol role='list' className='space-y-4 md:flex md:space-x-8 md:space-y-0'>
          {steps.map((step, index) => (
            <li key={step.name} className='md:flex-1'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-sky-600 transition-colors '>
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
                  <span className='text-sm font-medium text-gray-500 transition-colors'>
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
                  onSelect={handleGradeLevelSelect}
                />
                {errors.gradeLevel?.message && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.gradeLevel.message}
                  </p>
                )}
              </div>

              <div className='sm:col-span-3 flex flex-col pt-[36px]'>
                <SubjectSelection 
                  onSubjectSelect={handleSubjectSelect}
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
            <div className='col-span-full'>
                <FileUpload
                  label="Upload Document"
                  onFileAccepted={handleFileAccepted}
                />

                {fileData && (
                  <textarea
                    value={fileData}
                    onChange={handleOcrTextEdit}
                    className='mt-2 w-full p-2 border rounded'
                    rows={10}
                  />
                )}
                
                {errors.uploadedText?.message && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.uploadedText.message}
                  </p>
                )}
              </div>

          </motion.div>
          // <OCR onOcrComplete={function (ocrContent: string): void {
          //   throw new Error('Function not implemented.')
          // } } />
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className='col-span-full'>
                <FileUpload
                  label="Upload Document"
                  onFileAccepted={handleFileAccepted}
                />

                {fileData && (
                  <textarea
                    value={fileData}
                    onChange={handleOcrTextEdit}
                    className='mt-2 w-full p-2 border rounded'
                    rows={10}
                  />
                )}
                
                {errors.uploadedText?.message && (
                  <p className='mt-2 text-sm text-red-400'>
                    {errors.uploadedText.message}
                  </p>
                )}
              </div>
          </motion.div>
          
          // <OCR onOcrComplete={function (ocrContent: string): void {
          //   throw new Error('Function not implemented.')
          // } } />
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

      {/* Navigation */}
      <div className='mt-8 pt-5'>
        <div className='flex justify-between'>
          <button
            type='button'
            onClick={prev}
            disabled={currentStep === 0}
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
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
            className='rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
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
  )
}