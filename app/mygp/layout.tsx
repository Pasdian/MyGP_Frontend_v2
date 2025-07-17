import { AppSidebar } from '@/components/ui/app-sidebar';
import { SiteHeader } from '@/components/ui/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export default function MyGPLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="overflow-hidden"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <div className="w-dvw h-dvh max-w-dvw max-h-dvh overflow-y-scroll bg-white">
        <SidebarInset className="w-full h-full">
          <SiteHeader />
          <div className="h-full p-6 overflow-y-scroll">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
