import { useAuth } from '@/hooks/useAuth';
import {
  IconBuilding,
  IconLayoutGrid,
  IconListDetails,
  IconShield,
  IconUser,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getRefsByClient } from '@/types/casa/getRefsByClient';
import CollapsibleReferences from './Collapsibles/CollapsibleReferences';
import CollapsibleNavItem from './Collapsibles/CollapsibleNavItem';
import TailwindSpinner from './TailwindSpinner';
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
      ],
    },
  ],
};

export default function NavCollapsible() {
  const { user } = useAuth();
  const { clientNumber, initialDate, finalDate } = useDEAStore((state) => state);
  const pathname = usePathname();
  const {
    data: allReferences,
    isLoading: isAllReferencesLoading,
  }: { data: getRefsByClient[]; isLoading: boolean } = useSWRImmutable(
    clientNumber && initialDate && finalDate
      ? `/dea/getRefsByClient?client=${clientNumber}&initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : `/dea/getRefsByClient?client=000041`,
    axiosFetcher
  );

  if (isAllReferencesLoading)
    return (
      <div className="flex justify-center items-center">
        <TailwindSpinner className="h-12 w-12" />
      </div>
    );

  const filteredNav = userItems.navCollapsible
    .map((group) => {
      const filteredItems = group.items.filter((item) => item.role.includes(user.role.name));
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
        <CollapsibleReferences references={allReferences} />
      )}
    </>
  );
}
