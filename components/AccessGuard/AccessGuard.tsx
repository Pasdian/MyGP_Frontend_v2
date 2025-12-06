'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

type AccessGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
};

export default function AccessGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
  fallback = null,
}: AccessGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  const roleName = user?.complete_user?.role?.name ?? null;

  const isAdmin = roleName?.toLowerCase() === 'admin';

  let allowed = true;

  // Only check roles if provided
  if (allowedRoles && allowedRoles.length > 0) {
    // ADMIN always allowed
    allowed = isAdmin || allowedRoles.some((r) => hasRole(r));
  }

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
