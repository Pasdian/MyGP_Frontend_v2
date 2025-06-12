'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { GPClient } from '@/axios-instance';
import { toast } from 'sonner';

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // Generate breadcrumbs from the current path
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = '/' + array.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, label };
    });

  async function logout() {
    await GPClient.post('/api/auth/logout');
    toast.success('Cerraste sesión');
    router.refresh();
  }

  return (
    <header className="flex justify-between bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-1">
      <div className="flex align-center items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">MyGP</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div>
        <Button className="bg-red-500 hover:bg-red-600 cursor-pointer" onClick={logout}>
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}
