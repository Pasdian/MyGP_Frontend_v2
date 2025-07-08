'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import TailwindSpinner from '../ui/TailwindSpinner';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, userRoleUUID, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    } else if (allowedRoles && !allowedRoles.includes(userRoleUUID)) {
      router.push('/mygp/unauthorized'); // Redirect to unauthorized if role is not allowed
    }
  }, [isAuthenticated, userRoleUUID, allowedRoles, isLoading, router]);

  if (isLoading) return <TailwindSpinner />;
  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRoleUUID))) {
    return <TailwindSpinner />;
  }

  return children;
}
