import { useAuth } from '@/hooks/useAuth';
import {
  IconAdjustments,
  IconBuilding,
  IconKey,
  IconLayoutGrid,
  IconPackage,
  IconShield,
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

const userItems = {
  navCollapsible: [
    {
      title: 'Transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/mygp/transbel/entregas',
          module: ['Transbel Entregas', 'All Modules'],
          role: ['ADMIN', 'STARS', 'AAP'],
          icon: IconPackage,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          module: ['Transbel Interfaz', 'All Modules'],
          role: ['ADMIN', 'AAP'],
          icon: IconAdjustments,
        },
        {
          title: 'Cargues',
          url: '/mygp/transbel/cargues',
          module: ['Transbel Cargues', 'All Modules'],
          role: ['ADMIN', 'AAP'],
          icon: IconTruck,
        },
        {
          title: 'Cargue Manual',
          url: '/mygp/transbel/cargue_manual',
          module: ['Transbel Cargues', 'All Modules'],
          role: ['ADMIN', 'AAP'],
          icon: IconManualGearbox,
        },
      ],
    },
    {
      title: 'Sistema GIP',
      items: [
        {
          title: 'GIP',
          url: '/mygp/gip',
          module: ['All Modules'],
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
          module: ['All Modules'],
          role: ['ADMIN'],
          icon: IconUser,
        },
        {
          title: 'Roles',
          url: '/mygp/admin-panel/roles',
          module: ['All Modules'],
          role: ['ADMIN'],
          icon: IconShield,
        },
        {
          title: 'Compañias',
          url: '/mygp/admin-panel/companies',
          module: ['All Modules'],
          role: ['ADMIN'],
          icon: IconBuilding,
        },
        {
          title: 'Módulos',
          url: '/mygp/admin-panel/modules',
          module: ['All Modules'],
          role: ['ADMIN'],
          icon: IconLayoutGrid,
        },
        {
          title: 'Permisos',
          url: '/mygp/admin-panel/permissions',
          module: ['All Modules'],
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
    .map((group: { title: string; items: NavItem[] }) => {
      const cu = user?.complete_user;

      const userModules =
        (cu?.modules ?? [])
          .map((m) => m?.name)
          .filter((n): n is string => typeof n === 'string' && n.length > 0) ?? [];

      const hasAllModules = userModules.includes('All Modules');

      const userRoleName =
        typeof cu?.role?.name === 'string' && cu.role.name.length > 0 ? cu.role.name : null;

      const filteredItems = group.items.filter((item) => {
        const itemModules = item.module ?? [];
        const itemRoles = item.role ?? [];

        // Module-based access (preserves "All Modules")
        const hasModuleAccess =
          (itemModules.length > 0 && hasAllModules) ||
          itemModules.some((m) => userModules.includes(m));

        // Role-based access (single role on the user)
        const hasRoleAccess =
          !!userRoleName && itemRoles.length > 0 && itemRoles.includes(userRoleName);

        // Visible if either matches
        return hasModuleAccess || hasRoleAccess;
      });

      return filteredItems.length ? { ...group, items: filteredItems } : null;
    })
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

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
