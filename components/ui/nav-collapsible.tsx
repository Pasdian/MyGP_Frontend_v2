import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  IconAdjustments,
  IconPackage,
  IconUser,
  IconTruck,
  IconManualGearbox,
  IconFolderBolt,
  IconDoor,
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import CollapsibleReferences from './Collapsibles/CollapsibleReferences';
import CollapsibleNavItem from './Collapsibles/CollapsibleNavItem';
import { NavItem } from '@/types/nav/navItem';
import { BookPlusIcon, Container, SheetIcon } from 'lucide-react';
import { PERM, type Permission } from '@/lib/modules/permissions';

type NavItemDef = NavItem & {
  requires?: Permission[];
};

type NavGroupDef = {
  title: string;
  items: NavItemDef[];
};

const nav: NavGroupDef[] = [
  {
    title: 'Transbel',
    items: [
      {
        title: 'Entregas a Cliente',
        url: '/mygp/transbel/entregas',
        requires: [PERM.TRANSBEL_ENTREGAS],
        icon: IconPackage,
      },
      {
        title: 'Interfaz - Cod. Exc.',
        url: '/mygp/transbel/interfaz',
        requires: [PERM.TRANSBEL_INTERFAZ],
        icon: IconAdjustments,
      },
      {
        title: 'Cargues',
        url: '/mygp/transbel/cargues',
        requires: [PERM.TRANSBEL_CARGUES],
        icon: IconTruck,
      },
      {
        title: 'Cargue Manual',
        url: '/mygp/transbel/cargue_manual',
        requires: [PERM.TRANSBEL_CARGUE_MANUAL],
        icon: IconManualGearbox,
      },
      {
        title: 'Embarque',
        url: '/mygp/transbel/datos_embarque',
        requires: [PERM.TRANSBEL_DATOS_EMBARQUE],
        icon: Container,
      },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      {
        title: 'Referencias',
        url: '/mygp/operaciones/referencias',
        requires: [PERM.OPERACIONES_MODIFICAR_REFERENCIAS],
        icon: BookPlusIcon,
      },
            {
        title: 'Reportes',
        url: '/mygp/operaciones/reportes',
        requires: [PERM.OPERACIONES_REPORTES],
        icon: SheetIcon,
      },
    ],
  },
  {
    title: 'Sistema GIP',
    items: [
      {
        title: 'GIP',
        url: '/mygp/gip',
        requires: [PERM.SISTEMAGIP_EXPLORADOR],
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
        requires: [PERM.ADMIN_USUARIOS],
        icon: IconUser,
      },
      {
        title: 'Accesos',
        url: '/mygp/admin-panel/permissions',
        requires: [PERM.ADMIN_ACCESOS],
        icon: IconDoor,
      },
    ],
  },
];

const PERM_SET = new Set<string>(Object.values(PERM));

const isPermission = (p: string): p is Permission => PERM_SET.has(p);

const normalizePermissionActions = (perms: unknown): Permission[] => {
  if (!Array.isArray(perms)) return [];

  const actions = perms
    .map((x) => {
      if (!x || typeof x !== 'object') return undefined;
      const action = (x as { action?: unknown }).action;
      return typeof action === 'string' ? action : undefined;
    })
    .filter((a): a is string => typeof a === 'string');

  return actions.filter(isPermission);
};

export default function NavCollapsible() {
  const { user } = useAuth();
  const pathname = usePathname();

  const rawRolePerms = user?.complete_user?.role?.permissions;

  const effectivePermissions = useMemo(() => {
    const rolePerms = normalizePermissionActions(rawRolePerms);
    return new Set<Permission>(rolePerms);
  }, [rawRolePerms]);

  const filteredNav = useMemo(() => {
    const canAny = (perms: Permission[] = []) =>
      perms.length === 0 ? true : perms.some((p) => effectivePermissions.has(p));

    return nav
      .map((group) => {
        const items = group.items.filter((item) => canAny(item.requires));
        return items.length > 0 ? { ...group, items } : null;
      })
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
  }, [effectivePermissions]);

  return (
    <>
      {pathname !== '/mygp/dea' ? (
        filteredNav.map((group) => (
          <CollapsibleNavItem key={group.title} item={group} pathname={pathname} />
        ))
      ) : (
        <CollapsibleReferences />
      )}
    </>
  );
}
