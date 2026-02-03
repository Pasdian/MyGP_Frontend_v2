'use client';

import * as React from 'react';
import { NavMain } from '@/components/ui/nav-main';
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
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="flex justify-center data-[slot=sidebar-menu-button]:!p-0 overflow-visible"
            >
              <a href="/mygp/dashboard" className="block">
                <Image src="/logo.avif" alt="Company logo" width={100} height={50} />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain />
        <NavCollapsible />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
