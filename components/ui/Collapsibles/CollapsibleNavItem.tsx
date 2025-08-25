'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../sidebar';
import { ChevronRight } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { Icon, IconProps } from '@tabler/icons-react';
import Link from 'next/link';

export default function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: {
    items: {
      title: string;
      url: string;
      role: string[];
      icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
    }[];
    title: string;
  } | null;
  pathname: string;
}) {
  if (!item) return null;

  return (
    <Collapsible key={item.title} title={item.title} defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel
          asChild
          className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
        >
          <CollapsibleTrigger>
            {item.title}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent className="pl-4">
            <SidebarMenu>
              {item.items.map((link) => {
                const active = pathname === link.url;
                return (
                  <SidebarMenuItem
                    key={link.title}
                    className={
                      active
                        ? 'bg-blue-200 active:bg-blue-200 hover:bg-blue-300 rounded-md font-bold cursor-pointer'
                        : 'rounded-md font-bold cursor-pointer'
                    }
                  >
                    <SidebarMenuButton asChild isActive={active} className="text-xs">
                      <Link href={link.url} className="flex items-center gap-2">
                        {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                        <span className="truncate font-bold">{link.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
