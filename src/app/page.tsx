"use client";

import { useEffect, useRef } from 'react';
import { fadeUp } from '@/animations/gsap';
import { motion } from 'framer-motion';

import Navbar from '@/components/Navbar';
import Pricing from '@/components/main/Pricing';
import Hero from '@/components/main/Hero';
// import Hero from '@/components/main/Hero';
// import About from '@/components/main/About';
// import Features from '@/components/main/Features';
// import CTA from '@/components/main/CTA';
import Footer from '@/components/Footer';
import FeatureCardsDeck from '@/components/main/Features';
import HomeGrid from "@/components/main/HomeCards";

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLHeadingElement | HTMLParagraphElement | HTMLButtonElement)[]>([]);

  useEffect(() => {
    if (heroRef.current) {
      fadeUp(elementsRef.current.filter(el => el !== null) as HTMLElement[], heroRef.current, { delay: 0.05, start: 'top 80%', ease: 'power3.inOut' });
    }
  }, []);

  return (
    <div className='h-screen flex flex-col'>
      {/* TODO:Check bugs for Dynamic Navbar, i.e. fade out when scrolling and show up when scrolling up */}
      <Navbar />
      <Hero />
      <HomeGrid/>
      {/* <FeatureCardsDeck /> */}
      <Footer />
    </div>
  );
};

export default HomePage;
