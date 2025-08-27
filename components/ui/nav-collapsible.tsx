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
          module: ['Transbel Entregas', 'All Modules'],
          icon: IconListDetails,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          module: ['Transbel Interfaz', 'All Modules'],
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
          module: ['All Modules'],
          icon: IconUser,
        },
        {
          title: 'Roles',
          url: '/mygp/admin-panel/roles',
          module: ['All Modules'],
          icon: IconShield,
        },
        {
          title: 'Compañias',
          url: '/mygp/admin-panel/companies',
          module: ['All Modules'],
          icon: IconBuilding,
        },
        {
          title: 'Módulos',
          url: '/mygp/admin-panel/modules',
          module: ['All Modules'],
          icon: IconLayoutGrid,
        },
        {
          title: 'Permisos',
          url: '/mygp/admin-panel/permissions',
          module: ['All Modules'],
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
      const userModules = (user.complete_user?.modules ?? [])
        .map((m) => m.name)
        .filter((n): n is string => Boolean(n)); // only valid strings

      const filteredItems = group.items.filter((item) => {
        if (!item.module?.length) return false;

        // if user has "All Modules", show everything
        if (userModules.includes('All Modules')) return true;

        // otherwise check for overlap
        return item.module.some((m) => userModules.includes(m));
      });

      return filteredItems.length ? { ...group, items: filteredItems } : null;
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
