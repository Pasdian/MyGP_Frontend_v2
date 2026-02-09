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
      <div className="flex h-screen w-full">
        <AppSidebar variant="inset" />

        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />
          <main className="flex-1 overflow-x-hidden p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
