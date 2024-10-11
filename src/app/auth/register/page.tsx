'use client';

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { RegisterSchema } from '@/schema';

const RegisterPage = () => {

  return (
    <AuthForm mode="signup" schema={RegisterSchema}>
      <div className="mt-4 pt-2 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{' '}
        </span>
        <a
          href="/auth/login"
          className="text-sm text-blue-600 hover:underline"
        >
          Sign in
        </a>
      </div>
    </AuthForm>
  );
};

export default RegisterPage;
