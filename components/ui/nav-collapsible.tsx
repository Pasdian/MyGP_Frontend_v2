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

const userItems = {
  navCollapsible: [
    {
      title: 'Transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/mygp/transbel/entregas',
          role: ['ADMIN', 'STARS', 'TRANSBEL', 'TRANSBEL_ADMIN'],
          icon: IconPackage,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          role: ['ADMIN', 'TRANSBEL', 'TRANSBEL_ADMIN'],
          icon: IconAdjustments,
        },
        {
          title: 'Cargues',
          url: '/mygp/transbel/cargues',
          role: ['ADMIN', 'TRANSBEL_ADMIN'],
          icon: IconTruck,
        },
        {
          title: 'Cargue Manual',
          url: '/mygp/transbel/cargue_manual',
          role: ['ADMIN', 'TRANSBEL_ADMIN'],
          icon: IconManualGearbox,
        },
        {
          title: 'Workato Log',
          url: '/mygp/transbel/log_interfaz',
          role: ['ADMIN', 'TRANSBEL_ADMIN'],
          icon: IconAdjustments,
        },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        {
          title: 'Referencias',
          url: '/mygp/transbel/referencias',
          role: ['ADMIN', 'TRAFICO_ADMIN'],
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
          role: ['ADMIN', 'GIP'],
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
          role: ['ADMIN'],
          icon: IconUser,
        },
        {
          title: 'Permisos',
          url: '/mygp/admin-panel/permissions',
          role: ['ADMIN'],
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
