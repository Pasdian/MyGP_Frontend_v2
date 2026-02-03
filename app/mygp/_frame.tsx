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
      <div className="flex h-screen w-full">
        {/* Sidebar on the left */}
        <AppSidebar variant="inset" />

        {/* Main area: header + scrollable content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <SiteHeader />

          <main className="flex-1 overflow-x-hidden p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
