// const Footer = () => {
//     const currentYear = new Date().getFullYear();
  
//     return (
//       <footer className="bg-gray-800 text-white text-center p-3 mt-8 text-sm transition-opacity duration-500 opacity-0"
//       style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}>
//         <p>&copy; {currentYear} StudyBuddy. All rights reserved. </p>
//       </footer>
//     );
//   };
  
//   export default Footer;
  

import { FaLocationArrow } from "react-icons/fa6";
import { socialMedia } from "@/data";
import MagicButton from "@/components/ui/magic-button";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full pt-28 pb-10 bg-gradient-to-r from-gray-800/[0.5] via-black/[0.65] to-gray-800 text-white" id="contact">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Image
          src="/footer-grid.svg"
          alt="grid"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          quality={100}
        />
      </div>

      {/* Call to Action Section */}
      <div className="flex flex-col items-center px-4 text-center">
        <h1 className="heading lg:max-w-[45vw] text-2xl lg:text-5xl font-bold">
          Ready to take <span className="text-purple">your</span> digital presence to the next level?
        </h1>
        <p className="text-white-200 md:mt-10 my-5 lg:text-lg">
          Reach out to me today and let&apos;s discuss how I can help you achieve your goals.
        </p>
        <a href="mailto:focus.sgu@gmail.com">
          <MagicButton
            title="Let's get in touch"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      {/* Footer Content */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-16 w-full md:px-16 px-4">
        <p className="text-sm md:text-base font-light md:order-1 order-2 mt-4 md:mt-0">
          &copy; {currentYear} StudyBuddy. All rights reserved.
        </p>

        <div className="flex items-center md:gap-4 gap-6 p-2 md:mt-0 mt-4 order-1">
          {socialMedia.map((info) => (
            <div
              key={info.id}
              onClick={() => window.open(info.link)}
              className="w-12 h-12 cursor-pointer group flex justify-center items-center bg-opacity-90 backdrop-filter backdrop-blur-lg bg-black-200 rounded-full border border-gray-500 transition-all duration-300 transform hover:scale-110 hover:bg-opacity-100"
            >
              <div
                className={`h-6 w-6 transition-colors duration-300 ${
                  info.name === 'GitHub'
                    ? 'text-neutral-400 group-hover:text-white'
                    : info.name === 'Twitter'
                    ? 'text-neutral-400 group-hover:text-twitter'
                    : info.name === 'LinkedIn'
                    ? 'text-neutral-400 group-hover:text-linkedin'
                    : info.name === 'Discord'
                    ? 'text-neutral-400 group-hover:text-discord'
                    : ''
                }`}
              >
                {info.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;