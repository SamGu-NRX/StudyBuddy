// src/components/OCR/OCR.tsx
"use client";

import { SetStateAction, useEffect, useRef, useState } from 'react';
import { Group, Stack, Text, Image, Progress, Button } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { createWorker, PSM, OEM } from 'tesseract.js';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const OCR = ({ onOcrComplete }: { onOcrComplete: (ocrContent: string) => void }) => {
  const [imageData, setImageData] = useState<null | string>(null);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageData, setCroppedImageData] = useState<null | string>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('idle');
  const [ocrResult, setOcrResult] = useState('');
  const [isCropping, setIsCropping] = useState(false);

  const workerRef = useRef<Tesseract.Worker | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUri = reader.result;
      setImageData(imageDataUri as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const initializeWorker = async () => {
      const worker = await createWorker();
      workerRef.current = worker;
      worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, tessedit_ocr_engine_mode: OEM.LSTM_ONLY });
    };

    initializeWorker();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const getCroppedImg = () => {
    if (!crop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
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

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropComplete = () => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      setCroppedImageData(croppedImage);
      setIsCropping(false);
    }
  };

  const handleExtract = async () => {
    if (!croppedImageData || !workerRef.current) return;
  
    setProgressLabel('Processing...');
  
    const worker = workerRef.current;
  
    try {
      const result = await worker.recognize(croppedImageData);
      setOcrResult(result.data.text);
      onOcrComplete(result.data.text);
      console.log(result.data);
      setProgressLabel('Done');
    } catch (error) {
      console.error('OCR Error:', error);
      setProgressLabel('Error occurred');
    }
  };

  return (
    <Group align='initial' style={{ padding: '10px' }}>
      <Stack style={{ flex: '1' }}>
        <Dropzone
          onDrop={(files) => loadFile(files[0])}
          accept={IMAGE_MIME_TYPE}
          multiple={false}
          >
          <Text size="xl" inline>
            Drag image here or click to select file
          </Text>
        </Dropzone>

        {isCropping && imageData && (
          <ReactCrop crop={crop} onChange={c => setCrop(c)}>
            <Image ref={imgRef} src={imageData} alt="Upload" style={{ maxWidth: '100%' }} />
          </ReactCrop>
        )}

        {isCropping && <Button onClick={handleCropComplete}>Confirm Crop</Button>}

        {!isCropping && croppedImageData && (
          <Image src={croppedImageData} alt="Cropped image" style={{ width: '100%' }} />
        )}
      </Stack>

      <Stack style={{ flex: '1' }}>
        <Button disabled={!croppedImageData || !workerRef.current} onClick={handleExtract}>Extract</Button>
        <Text>{progressLabel.toUpperCase()}</Text>
        <Progress value={progress * 100} />

        {!!ocrResult && (
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
