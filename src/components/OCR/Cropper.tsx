
// import './App.css';
import { TopSection } from './Crop/LandingPage/TopSection';
import ImageCrop from './Crop/ImageCrop/ImageCrop';
import { useState } from 'react';

/**
 * Dead experiment: this component is not imported anywhere in the repo and
 * does not typecheck at this commit.
 *
 * What it WOULD do if it compiled: render a "React Image Crop / Editor"
 * section (see the h2 title below) in which a landing-page TopSection sets
 * an image URL, and that URL is then passed to an ImageCrop editor once set.
 *
 * Why it is dead at this commit:
 * - Lines 3-4 import './Crop/LandingPage/TopSection' and
 *   './Crop/ImageCrop/ImageCrop', neither of which exists in the repo
 *   (src/components/OCR/Crop/ contains only cropImage.tsx and index.tsx),
 *   so `npx tsc --noEmit` reports two TS2307 errors for this file.
 * - Nothing imports this component; the /OCR route (src/app/OCR/page.tsx)
 *   renders src/components/OCR/OCR instead.
 *
 * Appears to be a leftover React Image Crop / Editor experiment, documented
 * in place rather than deleted.
 */
function Cropper() {
  // Holds the selected image URL: setUrl is handed to TopSection, and a
  // non-empty url renders the ImageCrop editor with it.
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