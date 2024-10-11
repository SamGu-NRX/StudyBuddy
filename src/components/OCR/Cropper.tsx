
// import './App.css';
import { TopSection } from './Crop/LandingPage/TopSection';
import ImageCrop from './Crop/ImageCrop/ImageCrop';
import { useState } from 'react';

function Cropper() {
  const [url,setUrl]=useState('')
  
  return (
    <div className="App">
      <h2 className="title"> React Image Crop / Editor</h2>
     <TopSection setUrl={setUrl}/>
     {url && <ImageCrop url={url}/>}
    </div>
  );
}

export default Cropper;