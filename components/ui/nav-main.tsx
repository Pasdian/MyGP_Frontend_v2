'use client';

import { IconAddressBook, IconArrowLeft, IconDashboard } from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Album } from 'lucide-react'

const activeItemClass = 'rounded-none bg-gray-200 hover:bg-gray-300 font-bold cursor-pointer';
const inactiveItemClass = 'font-bold cursor-pointer';

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {pathname === '/mygp/dea' && (
            <Link href="/mygp/dashboard">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton tooltip="Quick Create" className="font-bold cursor-pointer">
                  <IconArrowLeft />
                  <span className="text-xs">Regresar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          )}
          {pathname !== '/mygp/dea' && (
            <Link href="/mygp/dashboard">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Dashboard Operativo"
                  className={pathname == '/mygp/dashboard' ? activeItemClass : inactiveItemClass}
                >
                  <IconDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          )}
          <Link href="/mygp/dea">
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="DEA"
                className={pathname == '/mygp/dea' ? activeItemClass : inactiveItemClass}
              >
                <IconAddressBook />
                <span>DEA</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Link>
          {pathname !== '/mygp/dea' && (
            <Link href="/mygp/expediente-digital-cliente">
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Expediente Digital Cliente"
                  className={pathname == '/mygp/expediente-digital-cliente' ? activeItemClass : inactiveItemClass}
                >
                  <Album />
                  <span>Exp. Digital Cliente</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
