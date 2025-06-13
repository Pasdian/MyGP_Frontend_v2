'use client';

import * as React from 'react';
import {
  IconDatabase,
  IconFileWord,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import NavCollapsible from './nav-collapsible';

const data = {
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
  ],
  extras: [
    {
      name: 'Data Library',
      url: '#',
      icon: IconDatabase,
    },
    {
      name: 'Reports',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userInfo, setUserInfo] = React.useState({ name: '', email: '', avatar: '' });

  React.useEffect(() => {
    const jsonData = localStorage.getItem('user_info');
    if (jsonData) {
      const jsonObj: { name: string; email: string } = JSON.parse(jsonData);
      setUserInfo((prevState) => ({ ...prevState, name: jsonObj.name, email: jsonObj.email }));
    }
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">MyGP.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain />
        <NavCollapsible />
        <NavDocuments items={data.extras} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
