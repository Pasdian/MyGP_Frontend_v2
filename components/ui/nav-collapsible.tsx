import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_ROLE_UUID,
  OPERACIONES_AAP_UUID,
  OPERACIONES_STARS_LOGISTICS_UUID,
} from '@/lib/roles/roles';
import { Icon, IconListDetails, IconProps, IconUser } from '@tabler/icons-react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

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
  const { isAuthLoading, userRoleUUID } = useAuth();
  const pathname = usePathname();

  if (isAuthLoading) return;

  const filteredNav = userItems.navCollapsible
    .map((group) => {
      const filteredItems = group.items.filter((item) => item.role.includes(userRoleUUID));
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
        <SidebarGroupContent className="pl-4">
          <SidebarMenu className="font-bold">
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
            <p>DEA Reference</p>
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </>
  );
}

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: {
    items: {
      title: string;
      url: string;
      role: string[];
      icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
    }[];
    title: string;
  } | null;
  pathname: string;
  key: string;
}) {
  if (!item) return;
  return (
    <Collapsible key={item.title} title={item.title} defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
        >
          <CollapsibleTrigger>
            {item.title}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="pl-4">
            <SidebarMenu>
              {item.items.map((item) => {
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={
                      pathname == item.url
                        ? 'bg-blue-200 active:bg-blue-200 hover:bg-blue-300 rounded-md font-bold cursor-pointer'
                        : 'rounded-md font-bold cursor-pointer'
                    }
                  >
                    <SidebarMenuButton asChild isActive={true}>
                      <Link href={item.url}>
                        {item.icon && <item.icon className="mr-2" />}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
