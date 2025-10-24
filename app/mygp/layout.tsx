'use client';

import { AppSidebar } from '@/components/ui/app-sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function MyGPLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider
      className="h-dvh min-h-0"
      style={
        {
          '--sidebar-width': `calc(var(--spacing) * ${pathname !== '/mygp/dea' ? 50 : 40})`,
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <div className="h-full min-h-0 w-full bg-white overflow-x-hidden overflow-y-hidden">
        <SidebarInset className="h-full min-h-0 flex flex-col">
          <div className="shrink-0" style={{ height: 'var(--header-height)' }}>
            <SiteHeader />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-8">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
