'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { AppSidebar } from '@/components/ui/app-sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function MyGPFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarWidth = pathname?.startsWith('/mygp/dea') ? 45 : 60;

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': `calc(var(--spacing) * ${sidebarWidth})`,
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen min-h-0 w-full">
        <AppSidebar variant="inset" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
