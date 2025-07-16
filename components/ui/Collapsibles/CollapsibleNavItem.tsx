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
  key: string;
}) {
  if (!item) return;
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
              {item.items.map((item) => {
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={
                      pathname == item.url
                        ? 'bg-blue-200 active:bg-blue-200 hover:bg-blue-300 rounded-md font-bold cursor-pointer'
                        : 'rounded-md font-bold cursor-pointer'
                    }
                  >
                    <SidebarMenuButton asChild isActive={true}>
                      <Link href={item.url}>
                        {item.icon && <item.icon className="mr-2" />}
                        {item.title}
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
