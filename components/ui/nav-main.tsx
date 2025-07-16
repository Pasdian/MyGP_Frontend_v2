'use client';

import { IconArrowLeft, IconDashboard } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';

const activeItemClass =
  'bg-blue-200 active:bg-blue-200 hover:bg-blue-300 rounded-md font-bold cursor-pointer';
const inactiveItemClass = 'rounded-md font-bold cursor-pointer';

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {pathname === '/mygp/dea' ? (
            <Link href="/mygp/dashboard">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="rounded-md font-bold cursor-pointer"
                >
                  <IconArrowLeft />
                  <span>Regresar al Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ) : (
            <Link href="/mygp/dashboard">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className={pathname == '/mygp/dashboard' ? activeItemClass : inactiveItemClass}
                >
                  <IconDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          )}
          <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
            <Link href="/mygp/dea">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className={pathname == '/mygp/dea' ? activeItemClass : inactiveItemClass}
                >
                  <IconDashboard />
                  <span>DEA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          </ProtectedRoute>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
