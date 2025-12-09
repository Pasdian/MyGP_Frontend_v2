import { useAuth } from '@/hooks/useAuth';
import {
  IconAdjustments,
  IconKey,
  IconPackage,
  IconUser,
  IconTruck,
  IconManualGearbox,
  IconFolderBolt,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import CollapsibleReferences from './Collapsibles/CollapsibleReferences';
import CollapsibleNavItem from './Collapsibles/CollapsibleNavItem';
import React from 'react';
import { NavItem } from '@/types/nav/navItem';
import { BookPlusIcon } from 'lucide-react';
import {
  ADMIN_ROLES,
  CARGUE_MANUAL_ROLES,
  CARGUE_ROLES,
  ENTREGAS_ROLES,
  GIP_ROLES,
  INTERFAZ_ROLES,
  OPERACIONES_REFERENCIAS_ROLES,
  WORKATO_LOG_ROLES,
} from '@/lib/modules/moduleRole';

const userItems = {
  navCollapsible: [
    {
      title: 'Transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/mygp/transbel/entregas',
          role: ENTREGAS_ROLES,
          icon: IconPackage,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          role: INTERFAZ_ROLES,
          icon: IconAdjustments,
        },
        {
          title: 'Cargues',
          url: '/mygp/transbel/cargues',
          role: CARGUE_ROLES,
          icon: IconTruck,
        },
        {
          title: 'Cargue Manual',
          url: '/mygp/transbel/cargue_manual',
          role: CARGUE_MANUAL_ROLES,
          icon: IconManualGearbox,
        },
        // {
        //   title: 'Embarque',
        //   url: '/mygp/transbel/datos_embarque',
        //   role: DATOS_EMBARQUE_ROLES,
        //   icon: Container,
        // },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        {
          title: 'Referencias',
          url: '/mygp/operaciones/referencias',
          role: OPERACIONES_REFERENCIAS_ROLES,
          icon: BookPlusIcon,
        },
      ],
    },
    {
      title: 'Sistema GIP',
      items: [
        {
          title: 'GIP',
          url: '/mygp/gip',
          role: GIP_ROLES,
          icon: IconFolderBolt,
        },
      ],
    },
    {
      title: 'Admin',
      items: [
        {
          title: 'Usuarios',
          url: '/mygp/admin-panel/users',
          role: ADMIN_ROLES,
          icon: IconUser,
        },
        {
          title: 'Permisos',
          url: '/mygp/admin-panel/permissions',
          role: ADMIN_ROLES,
          icon: IconKey,
        },
      ],
    },
  ],
};

export default function NavCollapsible() {
  const { user } = useAuth();
  const pathname = usePathname();

  const userRoleName =
    typeof user?.complete_user?.role?.name === 'string' && user.complete_user.role.name.length > 0
      ? user.complete_user.role.name
      : null;

  const filteredNav = userItems.navCollapsible
    .map((group: { title: string; items: NavItem[] }) => {
      const filteredItems = group.items.filter((item) => {
        const itemRoles = item.role ?? [];

        // If item has no roles defined, show it to everyone
        if (itemRoles.length === 0) return true;

        // If user has a role, check if item allows it
        return !!userRoleName && itemRoles.includes(userRoleName);
      });

      return filteredItems.length ? { ...group, items: filteredItems } : null;
    })
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <>
      {pathname !== '/mygp/dea' ? (
        filteredNav.map((item) => (
          <CollapsibleNavItem key={item.title} item={item} pathname={pathname} />
        ))
      ) : (
        <CollapsibleReferences />
      )}
    </>
  );
}
