import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_ROLE_UUID,
  OPERACIONES_AAP_UUID,
  OPERACIONES_STARS_LOGISTICS_UUID,
} from '@/lib/roles/roles';
import { IconListDetails, IconUser } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getRefsByClient } from '@/types/casa/getRefsByClient';
import CollapsibleReferences from './Collapsibles/CollapsibleReferences';
import CollapsibleNavItem from './Collapsibles/CollapsibleNavItem';

const userItems = {
  navCollapsible: [
    {
      title: 'Transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/mygp/transbel/entregas',
          role: [ADMIN_ROLE_UUID, OPERACIONES_STARS_LOGISTICS_UUID, OPERACIONES_AAP_UUID],
          icon: IconListDetails,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/mygp/transbel/interfaz',
          role: [ADMIN_ROLE_UUID, OPERACIONES_AAP_UUID],
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
          role: [ADMIN_ROLE_UUID],
          icon: IconUser,
        },
        {
          title: 'Roles',
          url: '/mygp/admin-panel/roles',
          role: [ADMIN_ROLE_UUID],
          icon: IconUser,
        },
      ],
    },
  ],
};

export default function NavCollapsible() {
  const { isLoading, user } = useAuth();
  const { clientNumber } = useDEAStore((state) => state);
  const pathname = usePathname();
  const {
    data: allReferences,
    isLoading: isAllReferencesLoading,
  }: { data: getRefsByClient[]; isLoading: boolean } = useSWRImmutable(
    `/api/casa/getRefsByClient?client=${clientNumber}`,
    axiosFetcher
  );

  if (isLoading) return;

  const filteredNav = userItems.navCollapsible
    .map((group) => {
      const filteredItems = group.items.filter((item) => item.role.includes(user.role));
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
        <CollapsibleReferences
          references={allReferences}
          clientNumber={clientNumber}
          isLoading={isAllReferencesLoading}
        />
      )}
    </>
  );
}
