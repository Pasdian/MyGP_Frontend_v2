'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PERM } from '@/lib/modules/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function GlosaIndexPage() {
  const router = useRouter();
  const { hasPermission, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (hasPermission(PERM.GLOSA_GLOSADOR_BANDEJA)) {
      router.replace('/mygp/glosa/bandeja');
    } else if (hasPermission(PERM.GLOSA_KAM_INBOX)) {
      router.replace('/mygp/glosa/mis-glosas');
    } else if (hasPermission(PERM.GLOSA_ADMIN_LIST)) {
      router.replace('/mygp/glosa/todas');
    }
    // else: no redirect — show "Sin acceso" below
  }, [isLoading, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    );
  }

  const hasAny =
    hasPermission(PERM.GLOSA_GLOSADOR_BANDEJA) ||
    hasPermission(PERM.GLOSA_KAM_INBOX) ||
    hasPermission(PERM.GLOSA_ADMIN_LIST);

  if (hasAny) {
    // Redirect in progress — show skeleton
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <Card className="p-6 max-w-sm text-center">
        <CardContent className="pt-0">
          <div className="text-lg font-semibold mb-2">Sin acceso al módulo de Glosa</div>
          <div className="text-sm text-[#737373]">
            Tu rol no tiene permisos para acceder a este módulo. Contacta al administrador.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
