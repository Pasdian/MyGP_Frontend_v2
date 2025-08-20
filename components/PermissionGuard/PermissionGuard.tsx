'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

export default function PermissionGuard({
  children,
  allowedPermissions,
}: {
  children: React.ReactNode;
  allowedPermissions: string[];
}) {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [isAuthenticated, user, allowedPermissions, isLoading, router, pathname]);

  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';

  if (
    !isAuthenticated ||
    (!isAdmin &&
      allowedPermissions &&
      !allowedPermissions.some((allowedPermission) =>
        user.complete_user.role.permissions.some(
          (userPermission) => userPermission.action === allowedPermission
        )
      ))
  ) {
    return null;
  }

  return children;
}
