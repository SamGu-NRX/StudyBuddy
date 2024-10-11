// File: components/OCRUploader.tsx
import React, { useState } from 'react'
import { Box, Button, Text, VStack, useToast } from '@chakra-ui/react'

const OCRUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const toast = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  // TODO: change to sonner to fit asthetics

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