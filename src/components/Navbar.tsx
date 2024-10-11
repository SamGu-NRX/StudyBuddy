import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import WaitlistButton from './WaitlistButton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import logoPic from '../assets/StudyBuddyLogo.png'
import Image from "next/image"



// Declare prevScrollY on the window object
declare global {
  interface Window {
    prevScrollY: number;
  }
}

const Navbar = () => {
  const [visible, setVisible] = useState(true);

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    if (scrollY < viewportHeight * 0.35) {
      setVisible(true);
    } else {
      setVisible(scrollY < viewportHeight * 0.35 || scrollY - window.prevScrollY < 0);
    }

    window.prevScrollY = scrollY;
  };

  useEffect(() => {
    window.prevScrollY = window.scrollY;
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
        }}
        className='px-8 py-10 md:px-36 fixed top-0 inset-x-0 mx-auto bg-transparent z-50'
      >
        <motion.div
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0, y: -50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.08,
              },
            },
          }}
          className='flex items-center justify-between py-4 border-[#3d4561] shadow-md border-spacing-1 rounded-2xl shadow-[#3d4561] bg-blue-100/1 px-7 bg-gradient-to-r from-blue-100 to-cyan-50 backdrop:blur-md'
        >
          {/* Name */}
          <motion.div
            className='flex space-x-2 items-center z-2'
            variants={{
              hidden: { opacity: 0, y: -50 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Image
              src={logoPic}
            width={40}
            height={40}
              alt="logo"
              />
            <Link href="/" className="text-slate-700 hover:text-black transition-all">
              <h1 className='text-3xl font-Outfit text-[#3d4561] md:text-2xl font-bold'>
                StudyBuddy
              </h1>
            </Link>
          </motion.div>

          {/* Links and Waitlist Button Container */}
          <motion.div
            className="flex space-x-4 items-center"
            variants={{
              hidden: { opacity: 0, y: -50 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="flex space-x-4">

              <Link href="/dashboard-force" className="text-slate-700 hover:text-black hover:underline transition-all">
                Dashboard
              </Link>
              <Link href="/auth/login" className="text-slate-700 hover:text-black hover:underline transition-all">
                Login
              </Link>
            </div>

            {/* Avatar and Dropdown Menu */}
              {/* <DropdownMenu>
               <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}

            <WaitlistButton />
          </motion.div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Navbar;
