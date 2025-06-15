import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/site-header';
import React from 'react';

export default function TransbelLayout({ children }: { children: React.ReactNode }) {
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
      <div className="max-w-full overflow-scroll">
        <SidebarInset>
          <SiteHeader />
          <div className="p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
