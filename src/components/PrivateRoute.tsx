// /components/ProtectedRoute.tsx
'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (status === "unauthenticated") router.push("/login"); // Redirect if not authenticated
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <p>Loading...</p>; // Display loading while checking authentication
  }

  return <>{children}</>;
};

export default ProtectedRoute;
