'use client';

import { AppSidebar } from '@/components/ui/app-sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export default function MyGPFrame({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 50)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar */}
        <AppSidebar variant="inset" />

        {/* Main shell */}
        <div className="flex flex-1 flex-col min-h-0">
          <SiteHeader />
          <main className="flex-1 min-h-0 p-4 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
