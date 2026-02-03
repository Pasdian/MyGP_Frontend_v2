'use client';

import { useState } from 'react';
import { IconDotsVertical, IconLogout, IconInfoCircle, IconMail } from '@tabler/icons-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { usePathname } from 'next/navigation';

const APP_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION ?? 'dev';

export function NavUser() {
  const { resetFileState } = useDEAStore((state) => state);
  const { user, logout, isLoading, getCasaUsername } = useAuth();
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const isDEA = pathname === '/mygp/dea';
  const [aboutOpen, setAboutOpen] = useState(false);

  if (isLoading) return null;

  return (
    <>
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
                    <span className="text-xs text-muted-foreground">
                      {getCasaUsername() || 'MYGP'}
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
              <DropdownMenuItem onClick={() => setAboutOpen(true)}>
                <IconInfoCircle className="mr-2 h-4 w-4" />
                <span>Acerca</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  resetFileState();
                }}
              >
                <IconLogout className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acerca de MYGP</DialogTitle>
            <DialogDescription>Información de la aplicación.</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-4 text-sm">
            {/* Version block */}
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Versión</span>
                <span className="font-mono text-xs">{APP_VERSION}</span>
              </div>
              <span className="rounded-full bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                MYGP
              </span>
            </div>

            {/* Contact block */}
            <div className="space-y-2 rounded-md border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <IconMail className="h-4 w-4" />
                <span>Contacto de soporte</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Si tienes algún problema con la aplicación, puedes escribir a cualquiera de los
                siguientes correos.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:sistemas03@pascal.com.mx"
                  className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  sistemas03@pascal.com.mx
                </a>
                <a
                  href="mailto:javier@pascal.com.mx"
                  className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  javier@pascal.com.mx
                </a>
                <a
                  href="mailto:miguel.gonzalez@pascal.com.mx"
                  className="inline-flex items-center rounded-full border bg-background px-2.5 py-1 text-xs font-mono transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  miguel.gonzalez@pascal.com.mx
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
