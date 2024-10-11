// deprecated

'use client';
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/../auth';

// Define the AuthContextType interface
interface AuthContextType {
  user: any;
  // login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  googleSignIn: () => void;
}

// Define the AuthProviderProps interface
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);

  // // Email/password login function

  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await fetch('/api/token-auth/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setUser(data);
  //       localStorage.setItem('token', data.token);
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //     return false;
  //   }
  // };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    signOut(auth);
  };

  // Google sign-in function
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  // Firebase auth state change effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // console.log('User:', currentUser);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    // login,
    logout,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
