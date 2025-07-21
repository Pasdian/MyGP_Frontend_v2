'use client';

import * as React from 'react';
import {
  IconDatabase,
  IconFileWord,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
} from '@tabler/icons-react';

import { NavMain } from '@/components/ui/nav-main';
import { NavSecondary } from '@/components/ui/nav-secondary';
import { NavUser } from '@/components/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import NavCollapsible from './nav-collapsible';

const data = {
  navSecondary: [
    {
      title: 'Ajustes',
      url: '#',
      icon: IconSettings,
    },
  ],
  extras: [
    {
      name: 'Apartado 1',
      url: '#',
      icon: IconDatabase,
    },
    {
      name: 'Apartado 2',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Apartado 3',
      url: '#',
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">MyGP.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain />
        <NavCollapsible />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
