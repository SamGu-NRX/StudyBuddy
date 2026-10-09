// File: components/OCR/Uploader.tsx
import React, { useState } from 'react'
import { Box, Button, Text, VStack, useToast } from '@chakra-ui/react'

/**
 * OCRUploader — UI mock of the file-upload step of the OCR flow.
 *
 * STATUS: dead prototype. As of commit 2151ee4 this component is not imported
 * anywhere in the repo (grep for `Uploader` / `OCRUploader` finds only this
 * file); the live pipeline is OCR.tsx instead — Mantine-based, with real
 * in-browser OCR via tesseract.js.
 *
 * Everything here is simulated: "uploading" never sends the file anywhere —
 * no tesseract worker, no network request. The flow is toasts only: an error
 * toast if no file is selected, an info "processing" toast, then a 3-second
 * setTimeout that fakes a success toast.
 *
 * Known mismatches with the real pipeline, kept for the record:
 * - UI kit: @chakra-ui/react here vs @mantine/core in OCR.tsx (the app ships
 *   both as dependencies).
 * - `accept="image/*,.pdf"` advertises PDFs, but the real pipeline's Mantine
 *   Dropzone is restricted to image MIME types (IMAGE_MIME_TYPE).
 */
const OCRUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const toast = useToast()

  // Copies the first selected file into state; the name is echoed below.
  // The file is never read, validated, or uploaded.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  // TODO: change to sonner to fit asthetics

  // Fake "upload": error toast when nothing is selected, an info
  // "processing" toast, then a 3 s setTimeout fakes the success toast.
  // Despite `async`, nothing is awaited and nothing leaves the browser.
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Simulated OCR processing
    // TODO: add dot bounce animation
    toast({
      title: 'OCR Processing',
      description: 'Your file is being processed...', 
      status: 'info',
      duration: 3000,
      isClosable: true,
    })


    // Here you would typically send the file to your backend for OCR processing
    // For now, we'll just simulate a successful upload
    setTimeout(() => {
      toast({
        title: 'OCR Complete',
        description: 'Your file has been successfully processed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }, 3000)
  }

  return (
    <Box className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
      <VStack spacing={4}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button as="span" colorScheme="teal">
            Select File
          </Button>
        </label>
        {file && <Text>{file.name}</Text>}
        <Button onClick={handleUpload} colorScheme="blue" isDisabled={!file}>
          Upload for OCR
        </Button>
      </VStack>
    </Box>
  )
}

export default OCRUploader