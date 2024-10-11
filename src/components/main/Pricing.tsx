"use client";

// src\components\main\Pricing.tsx
import React, { useEffect, useRef } from 'react';
import { fadeUp } from '@/animations/gsap';
import CheckIcon from '@/assets/check.svg';
import { twMerge } from 'tailwind-merge';
import '@/app/globals.css';


const pricingTiers = [
    {
      title: "Free",
      monthlyPrice: 0,
      buttonText: "Get started for free",
      popular: false,
      inverse: false,
      features: [
        "Up to 5 project members",
        "Unlimited tasks and projects",
        "2GB storage",
        "Integrations",
        "Basic support",
      ],
    },
    {
      title: "Pro",
      monthlyPrice: 9,
      buttonText: "Sign up now",
      popular: true,
      inverse: true,
      features: [
        "Up to 50 project members",
        "Unlimited tasks and projects",
        "50GB storage",
        "Integrations",
        "Priority support",
        "Advanced support",
        "Export support",
      ],
    },
    {
      title: "Business",
      monthlyPrice: 19,
      buttonText: "Sign up now",
      popular: false,
      inverse: false,
      features: [
        "Up to 5 project members",
        "Unlimited tasks and projects",
        "200GB storage",
        "Integrations",
        "Dedicated account manager",
        "Custom fields",
        "Advanced analytics",
        "Export capabilities",
        "API access",
        "Advanced security features",
      ],
    },
  ];
  
const Pricing = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      fadeUp(card, card, { delay: index * 0.1 });
    });
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto">
        <div className='section-heading'>
          <h2 className="section-title"> 
            Pricing
          </h2>
        </div>

        <p className="section-description mt-5 mb-8">
          Free forever. Upgrade for unlimited tasks, better security, and exclusive features.
        </p>

        <div className='py-10 flex flex-wrap gap-6 items-center justify-center'>
          {pricingTiers.map(
            ({
              title,
              monthlyPrice,
              buttonText,
              popular,
              inverse,
              features,
            }, index) => (
              <div key={title}   
                ref={el => { if (el) cardRefs.current[index] = el; }}
                className={twMerge("p-10 rounded-3xl border border-[#F1F1F1] shadow-[0_7px_14px_#EAEAEA] max-w-xs w-full", 
                inverse === true && 'border-black bg-black text-white')}>

                <div className="flex justify-between">
                  <h3 className={twMerge("text-lg font-bold text-black/50", inverse === true && 'text-white/60')}>
                    {title}
                  </h3>
                  {popular === true && (
                    <div className='inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20'>
                      <span className='bg-rainbow-gradient text-transparent bg-clip-text font-semibold'>
                        Popular
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none">
                      ${monthlyPrice}
                  </span>
                  <span className='tracking-tight font-bold text-black/50'>/month</span>
                </div>
                <button className={twMerge('w-full mt-[30px] pricing-btn', inverse === true && 'bg-white text-black')}>
                  {buttonText}
                  {/* pricing-btn class to be implemented, shadcn/ui black theme as ref */}
                </button>
                
                <ul className="flex flex-col gap-5 mt-8">
                  {features.map((feature, index) => (
                    <li key={index} className='text-sm flex items-center gap-4'>
                      <CheckIcon className='h-6 w-6'/>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

      </div>
    </section>
  );
};


export default Pricing;