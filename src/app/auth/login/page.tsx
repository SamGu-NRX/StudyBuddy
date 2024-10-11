'use client';

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { LoginSchema } from '@/schema';

const SignInPage = () => {
  return (
    <AuthForm mode="signin" schema={LoginSchema}>
      <div className="mt-4 pt-2 text-center">
        <a
          href="/auth/reset-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot password?
        </a>
      </div>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
        </span>
        <a
          href="/auth/register"
          className="text-sm text-blue-600 hover:underline"
        >
          Sign up
        </a>
      </div>
    </AuthForm>
  );
};

export default SignInPage;
