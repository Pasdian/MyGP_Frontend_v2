'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Permission } from '@/lib/modules/permissions';

type PermissionGuardProps = {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
};

export default function PermissionGuard({ children, requiredPermissions }: PermissionGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  if (requiredPermissions?.length) {
    const allowed = requiredPermissions.some((p) => hasPermission(p));
    if (!allowed) return null;
  }

  return <>{children}</>;
}
