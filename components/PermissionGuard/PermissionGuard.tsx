'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type PermissionGuardProps = {
  children: React.ReactNode;
  requiredPermissions?: string[];
};

export default function PermissionGuard({ children, requiredPermissions }: PermissionGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  const isAdmin = hasRole('ADMIN');

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  // Skip permission checks for admin
  if (!isAdmin && requiredPermissions?.length) {
    const allowed = requiredPermissions.some((p) => hasPermission(p));
    if (!allowed) return null;
  }

  return <>{children}</>;
}
