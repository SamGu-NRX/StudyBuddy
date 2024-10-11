'use client';

import React, { useState, useTransition } from 'react';
// import { useSession, signIn, signOut } from 'next-auth/react';
import { z, ZodSchema } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
// import { useAuth } from '@/context/AuthProvider';
import { useSession, signIn } from 'next-auth/react';
import { GoogleSignInButton, DiscordSignInButton, GithubSignInButton, EmailSignInButton } from './AuthButtons';

// change to server (redirect instead of useRouter) for performance and SEO
import { useRouter } from 'next/navigation';
import Email from 'next-auth/providers/email';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner'
import { callbackify } from 'util';

// Define types for state variables
interface Errors {
  [key: string]: string | undefined;
}

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'resetPassword';
  schema: ZodSchema;
  children: React.ReactNode;
  csrfToken?: string;
}

interface FieldValues {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}


const AuthForm = ({ mode, schema, children, csrfToken }: AuthFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition()

  // import and initalize zod schema

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        }).then((result) => {
          if (result && result.error) {
            toast.error(result.error);
          } else {
            handlePostAuth();
          }
        });
      } else if (mode === 'signup') {
        // sign up logic
        // Replace with your actual sign-up logic
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (result && result.error) {
          toast.error(result.error);
        } else {
          toast.success('Registration successful, please check your email to verify your account.');
          // email?
        }
      } else if (mode === 'resetPassword') {
        // Add reset password logic
        // Replace with your actual reset password logic
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.email }),
        });
        const result = await response.json();
        if (result && result.error) {
          toast.error(result.error);
        } else {
          toast.success('Password reset email sent.');
        }
      }
    } catch (error) {
      toast.error('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (provider: string = '') => {
    setIsLoading(true);
    try {
      if (provider) {
        await signIn(provider, { redirectTo: false }).then((result) => {
          if (result && result.error) {
            console.error(result.error);
          } else {
            handlePostAuth();
          };
        });
      }
    } catch (error) {
      toast.error('An error occurred: ' + error);
    } finally {
      setIsLoading(false);
    }
  };


  const handlePostAuth = async () => {
    const session = await fetch('/api/auth/session').then(res => res.json());
    // if (!session.user.emailVerified) {
    //   router.push('/confirm-email');
    // } else
    if (session.user.firstTime) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  const inputClassNames = (field: keyof FieldValues) => {
    let baseClasses = "w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors";
    if (errors[field]) {
      baseClasses += " border-pink-500 text-pink-600 focus:border-pink-500 focus:ring-pink-500";
    }
    return baseClasses;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-500 via-blue-500 to bg-purple-500 p-4 font-Inter" style={{ animation: 'bounceIn 1s ease-in-out' }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {mode === 'signup' && (
            <input
              type="name"
              {...register('firstName')}
              placeholder="First Name"
              className={inputClassNames('firstName')}
            />
          )}
          
          {mode === 'signup' && (
            <input
              type="name"
              {...register('lastName')}
              placeholder="Last Name"
              className={inputClassNames('lastName')}
            />
          )}

          <input
            type="email"
            {...register('email')}
            placeholder="Email"
            className={inputClassNames('email')}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

          {mode !== 'resetPassword' && (
            <>
              <input
                type="password"
                {...register('password')}
                placeholder="Password"
                className={inputClassNames('password')}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1 pb-1">{errors.password.message}</p>}
            </>
          )}

          <EmailSignInButton mode={mode} isLoading={isLoading}/>

        </form>

        <div className="mt-4 flex flex-col space-y-2">
          {(mode === 'signin' || mode === 'signup') && (
            <GoogleSignInButton handleClick={() => handleSignIn('google')} isLoading={isLoading}/>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <DiscordSignInButton handleClick={() => handleSignIn('discord')} isLoading={isLoading}/>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <GithubSignInButton  handleClick={() => handleSignIn('github')} isLoading={isLoading}/>
          )}

          {children}

        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;