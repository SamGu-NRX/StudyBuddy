"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Group, Stack, Text, Image, Progress, Button, Modal } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { createWorker, PSM, OEM } from 'tesseract.js';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

/**
 * Client-side OCR intake panel: turns an uploaded image into text.
 *
 * Renders a Mantine `Dropzone` until an image is present, then a clickable
 * preview. Clicking the preview opens a modal where the image can be zoomed
 * and a region selected; confirming the crop replaces the preview with the
 * cropped JPEG and immediately runs recognition on it. A tesseract worker
 * (English model) is created once on mount and terminated on unmount, so
 * recognition is only available while this component is mounted.
 *
 * Props:
 * - `onOcrComplete` — invoked with the recognized text after each successful
 *   run; the only channel through which results leave this component.
 * - `initialFile` — when provided, loaded on mount (or whenever the prop
 *   identity changes) as if it had been dropped on the dropzone.
 */
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

  // Asynchronously reads a picked file into a base64 data URL and stores it
  // as `imageData`, which swaps the dropzone for the preview. Touches no
  // other state, so a previous run's result panel and progress bar stay as
  // they were until recognition runs again.
  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      setImageData(imageDataUri as string);
    };
    reader.readAsDataURL(file);
  };

  // Mounts a tesseract worker for the English model with automatic page
  // segmentation and the LSTM-only engine, and tears it down on unmount.
  // Until the async initialization finishes, `workerRef` is null and any
  // recognition request hits handleExtract's guard and is silently dropped.
  // A rejected createWorker here surfaces only as an unhandled promise
  // rejection and leaves the component permanently without OCR.
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

  // Paints the selected crop of `image` onto an offscreen canvas — rescaling
  // from displayed to natural pixels — and encodes it as a quality-1 JPEG
  // data URL. The promise has no reject path: when the canvas yields no
  // blob, this function only logs and never settles, leaving an awaiting
  // caller (handleCropComplete) hanging.
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

  // Confirm Crop handler for the modal. Produces the cropped JPEG data URL,
  // promotes it to the preview image (so the displayed image becomes the
  // cropped one), closes the modal, and fires recognition without awaiting
  // it. A no-op when no selection exists or the modal image ref is unset —
  // the button stays enabled but gives the user no feedback.
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

  // Runs recognition on the given data URL and publishes the result. Resets
  // the progress UI, awaits the worker, then passes the text to
  // `onOcrComplete` and reveals the result panel after a 500 ms delay. No
  // logger is attached to the worker, so the progress bar holds at 0 for
  // the whole run and only jumps to 100 afterwards; errors leave it at 0
  // with the label 'Error occurred'. The parameter shadows the `imageData`
  // state variable — inside this function only the argument is visible.
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

  // Steps the modal image's visual zoom up 0.1x, clamped to MAX_ZOOM;
  // the Zoom In button disables at the ceiling.
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, MAX_ZOOM));
  };

  // Steps the modal image's visual zoom down 0.1x, clamped to MIN_ZOOM;
  // the Zoom Out button disables at the floor.
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