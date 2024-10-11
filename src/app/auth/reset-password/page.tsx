'use client';

import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { ResetSchema } from '@/schema';

const ResetPasswordPage = () => {


  return (
    <AuthForm mode="resetPassword" schema={ResetSchema}>
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-600">
          Remembered your password?{' '}
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

export default ResetPasswordPage;
