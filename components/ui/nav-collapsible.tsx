import { useAuth } from '@/hooks/useAuth';
import {
  IconBuilding,
  IconKey,
  IconLayoutGrid,
  IconListDetails,
  IconShield,
  IconUser,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import CollapsibleReferences from './Collapsibles/CollapsibleReferences';
import CollapsibleNavItem from './Collapsibles/CollapsibleNavItem';
import React from 'react';

const userItems = {
  navCollapsible: [
    {
      title: 'Transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/mygp/transbel/entregas',
          role: ['ADMIN', 'STARS', 'AAP'],
          icon: IconListDetails,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          role: ['ADMIN', 'AAP'],
          icon: IconListDetails,
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
          title: 'Roles',

          url: '/mygp/admin-panel/roles',
          role: ['ADMIN'],
          icon: IconShield,
        },
        {
          title: 'Compañias',

          url: '/mygp/admin-panel/companies',
          role: ['ADMIN'],
          icon: IconBuilding,
        },
        {
          title: 'Módulos',

          url: '/mygp/admin-panel/modules',
          role: ['ADMIN'],
          icon: IconLayoutGrid,
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

  const filteredNav = userItems.navCollapsible
    .map((group) => {
      const filteredItems = group.items.filter((item) =>
        item.role.includes(user.complete_user?.role?.name)
      );
      return filteredItems.length > 0 ? { ...group, items: filteredItems } : null;
    })
    .filter(Boolean);

  return (
    <>
      {pathname !== '/mygp/dea' ? (
        filteredNav.map((item) => {
          if (!item) return;
          return <CollapsibleNavItem key={item.title} item={item} pathname={pathname} />;
        })
      ) : (
        <CollapsibleReferences />
      )}
    </>
  );
}
