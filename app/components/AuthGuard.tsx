'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DataInitializer from './DataInitializer';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication on client side
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      // If not authenticated and not on login page, redirect to login
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }
      
      // If authenticated and on login page, redirect to dashboard
      if (isAuthenticated && pathname === '/login') {
        router.push('/dashboard/users');
      }
    }
  }, [router, pathname]);

  // Don't render children if not authenticated (except on login page)
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated && pathname !== '/login') {
      return null;
    }
  }

  return (
    <>
      <DataInitializer />
      {children}
    </>
  );
}
