'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import TailwindSpinner from '../ui/TailwindSpinner';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, user, allowedRoles, isLoading, router, pathname]);

  if (isLoading) return <TailwindSpinner className="h-12 w-12" />;
  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(user.role))) {
    return;
  }

  return children;
}
