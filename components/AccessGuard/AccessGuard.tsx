'use client';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

type AccessGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedModules?: string[];
  allowedPermissions?: string[];
  /** require all listed modules/permissions instead of any */
  requireAllModules?: boolean;
  requireAllPermissions?: boolean;
  /** where to send unauthenticated users */
  redirectTo?: string;
  /** what to render when authenticated but unauthorized */
  fallback?: React.ReactNode;
};

function hasAccess(opts: {
  isAdmin: boolean;
  userRoles?: string | null;
  userModuleNames?: (string | null)[] | null;
  userPermissions?: ({ action: string | null } | null)[] | null;
  allowedRoles?: string[];
  allowedModules?: string[];
  allowedPermissions?: string[];
  requireAllModules?: boolean;
  requireAllPermissions?: boolean;
}) {
  const {
    isAdmin,
    userRoles,
    userModuleNames,
    userPermissions,
    allowedRoles = [], // default to []
    allowedModules = [], // default to []
    allowedPermissions = [], // default to []
    requireAllModules,
    requireAllPermissions,
  } = opts;

  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

  if (isAdmin) return true;

  // Build normalized sets
  const moduleSet = new Set((userModuleNames ?? []).map(norm).filter(Boolean));
  const permSet = new Set((userPermissions ?? []).map((p) => norm(p?.action)).filter(Boolean));

  // 🔑 All Modules bypass (early)
  if (moduleSet.has(norm('All Modules'))) return true;

  let roleOk = true;
  if (allowedRoles.length > 0) {
    roleOk = !!userRoles && allowedRoles.map(norm).includes(norm(userRoles));
  }

  // MODULE check
  let moduleOk = true;
  if (allowedModules.length > 0) {
    if (requireAllModules) {
      moduleOk = allowedModules.map(norm).every((m) => moduleSet.has(m));
    } else {
      moduleOk = allowedModules.map(norm).some((m) => moduleSet.has(m));
    }
  }

  // PERMISSION check (keep as AND logic, usually permissions are strict)
  let permOk = true;
  if (allowedPermissions.length > 0) {
    if (requireAllPermissions) {
      permOk = allowedPermissions.map(norm).every((p) => permSet.has(p));
    } else {
      permOk = allowedPermissions.map(norm).some((p) => permSet.has(p));
    }
  }

  // final decision: must pass permissions, and (role OR module)
  return permOk && (roleOk || moduleOk);
}

export default function AccessGuard({
  children,
  allowedRoles,
  allowedModules,
  allowedPermissions,
  requireAllModules = false,
  requireAllPermissions = false,
  redirectTo = '/mygp/dashboard',
  fallback = null,
}: AccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, pathname]);

  if (isLoading) return null; // or a spinner

  if (!isAuthenticated) return null;

  const cu = user?.complete_user;
  const ok = hasAccess({
    isAdmin: cu?.role?.name === 'ADMIN',
    userRoles: cu?.role?.name ?? null,
    userModuleNames: cu?.modules?.map((m) => m?.name) ?? [],
    userPermissions: cu?.role?.permissions ?? [],
    allowedRoles,
    allowedModules,
    allowedPermissions,
    requireAllModules,
    requireAllPermissions,
  });

  if (!ok) return <>{fallback}</>;

  return <>{children}</>;
}
