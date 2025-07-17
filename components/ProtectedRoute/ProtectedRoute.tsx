'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

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

  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(user.role))) {
    return;
  }

  return children;
}
