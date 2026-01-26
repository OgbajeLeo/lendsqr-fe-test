'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }
      
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
      {children}
    </>
  );
}
