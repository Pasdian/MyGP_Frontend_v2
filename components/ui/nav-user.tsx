'use client';

import { IconDotsVertical, IconLogout } from '@tabler/icons-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { usePathname } from 'next/navigation';

export function NavUser() {
  const { resetFileState } = useDEAStore((state) => state);
  const { user, logout, isLoading } = useAuth();
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const isDEA = pathname === '/mygp/dea';

  if (isLoading) return;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {!isDEA && (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-indigo-400 rounded-lg">
                    {`${user?.complete_user?.user?.name?.split(' ')[0][0]}`}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-md leading-tight">
                  <span className="truncate font-medium">
                    {user?.complete_user?.user?.name?.split(' ')[0]}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={() => {
                logout();
                resetFileState();
              }}
            >
              <IconLogout />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
