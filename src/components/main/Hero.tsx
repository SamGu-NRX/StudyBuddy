import { useEffect, useRef } from 'react';
import { fadeUp } from '@/animations/gsap';
import { motion } from 'framer-motion';


const Hero = () => {
    const heroRef = useRef<HTMLDivElement>(null);
    const elementsRef = useRef<(HTMLHeadingElement | HTMLParagraphElement | HTMLButtonElement)[]>([]);
    useEffect(() => {
        if (heroRef.current) {
          fadeUp(elementsRef.current.filter(el => el !== null) as HTMLElement[], heroRef.current, { delay: 0.05, start: 'top 80%', ease: 'power3.inOut' });
        }
      }, []);

    return (
      <div className='flex-grow flex justify-center items-center'>
        {/* Edit title so that the title is centered relative to vh */}
        <div
          className="hero bg-homebackground bg-[#444444] bg-cover bg-blend-multiply w-full h-[100vh] flex flex-col justify-center items-center py-10"
          ref={heroRef}
        >
          <h1 className="text-white text-5xl font-bold" ref={el => { if (el) elementsRef.current[0] = el; }}>StudyBuddy</h1>
          <p className="text-white mt-4" ref={el => { if (el) elementsRef.current[1] = el; }}>Your All-in-One Intelligent Study Companion</p>
          <motion.button 
            className="mt-6 px-4 py-2 bg-white text-black-500 font-bold rounded-full "
            ref={el => { if (el) elementsRef.current[2] = el; }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.location.href = "/auth/login";
            }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    );
}


export default Hero;