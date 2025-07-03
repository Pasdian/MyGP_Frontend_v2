'use client';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLE } from '@/lib/roles/roles';

export default function AdminPanelRoles() {
  const { user, isUserLoading } = useAuth();
  if (isUserLoading) return;
  if (!user) return;
  if (user.role != ADMIN_ROLE) return <p>No tienes permisos para ver este contenido.</p>;
  return <p>Hola mundo</p>;
}
