"use client";

import { useSession } from 'next-auth/react';
import PrivateRoute from '@/components/PrivateRoute';
import Dashboard from '@/components/Generation/Dashboard/Dashboard';
import { UserRole } from '.prisma/client/default.js';
import { Session } from 'next-auth';

interface SessionType extends Session {
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
}

const DashboardNav = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  );
};

export default DashboardNav;