"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Group, Stack, Text, Image, Progress, Button, Modal } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { createWorker, PSM, OEM } from 'tesseract.js';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const OCR = ({ onOcrComplete, initialFile }: { onOcrComplete: (ocrContent: string) => void, initialFile?: File | null }) => {
  const [imageData, setImageData] = useState<null | string>(null);
  const [crop, setCrop] = useState<Crop>();
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Idle');
  const [ocrResult, setOcrResult] = useState('');
  const [showOcrResult, setShowOcrResult] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  const workerRef = useRef<Tesseract.Worker | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      setImageData(imageDataUri as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const initializeWorker = async () => {
      const worker = await createWorker("eng");
      workerRef.current = worker;
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
        tessedit_ocr_engine_mode: OEM.LSTM_ONLY,
      });
    };
    
    initializeWorker();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (initialFile) {
      loadFile(initialFile);
    }
  }, [initialFile]);

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
        },
        'image/jpeg',
        1  // JPEG quality
      );
    });
  };

  const handleCropComplete = async () => {
    if (!crop || !imgRef.current) return;

    try {
      const croppedImageUrl = await getCroppedImg(imgRef.current, crop);
      setImageData(croppedImageUrl);
      setIsZoomModalOpen(false);
      handleExtract(croppedImageUrl);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  const handleExtract = async (imageData: string) => {
    if (!imageData || !workerRef.current) return;
  
    setProgressLabel('Processing...');
    setProgress(0);
    setShowOcrResult(false);
  
    const worker = workerRef.current;
  
    try {
      const result = await worker.recognize(imageData);
      
      setOcrResult(result.data.text);
      onOcrComplete(result.data.text);
      console.log(result.data);
      
      // Ensure progress reaches 100%
      setProgress(100);
      setProgressLabel('Done');
      setTimeout(() => setShowOcrResult(true), 500); // Delay showing the result
    } catch (error) {
      console.error('OCR Error:', error);
      setProgressLabel('Error occurred');
    }
  };

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, MIN_ZOOM));
  };

  return (
    <Group align='initial' style={{ padding: '10px' }}>
      <Stack style={{ flex: '1' }}>
        {!imageData && (
          <Dropzone
            onDrop={(files) => loadFile(files[0])}
            accept={IMAGE_MIME_TYPE}
            multiple={false}
          >
            <Text size="xl" inline>
              Drag image here or click to select file
            </Text>
          </Dropzone>
        )}

        {imageData && (
          <Image 
            src={imageData} 
            alt="Upload" 
            style={{ maxWidth: '100%', cursor: 'pointer' }} 
            onClick={() => {
              setIsZoomModalOpen(true);
              setCrop(undefined);
              setZoom(1);
            }}
          />
        )}

        <Modal
          opened={isZoomModalOpen}
          onClose={() => {
            setIsZoomModalOpen(false);
          }}
          size="xl"
        >
          <Stack>
            <Group>
              <Button onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>Zoom In</Button>
              <Button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>Zoom Out</Button>
              <Button onClick={handleCropComplete}>Confirm Crop</Button>
            </Group>
            <ReactCrop crop={crop} onChange={c => setCrop(c)}>
              <Image 
                ref={imgRef} 
                src={imageData} 
                alt="Upload" 
                style={{ 
                  maxWidth: '100%', 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left'
                }} 
              />
            </ReactCrop>
          </Stack>
        </Modal>
      </Stack>

      <Stack style={{ flex: '1' }}>
        <Text>{progressLabel}</Text>
        <Progress value={progress} animated />

        {showOcrResult && !!ocrResult && (
          <Stack>
            <Text size='xl'>RESULT</Text>
            <Text style={{ fontFamily: 'monospace', background: 'white', padding: '10px' }}>{ocrResult}</Text>
          </Stack>
        )}
      </Stack>
    </Group>
  );
}

export default OCR;