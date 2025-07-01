import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { IconListDetails } from '@tabler/icons-react';
import { ChevronRight } from 'lucide-react';

const items = {
  navCollapsible: [
    {
      title: 'Transbel',
      url: '/transbel',
      items: [
        {
          title: 'Entregas a Cliente',
          url: '/transbel/entregas',
          icon: IconListDetails,
        },
        {
          title: 'Interfaz - Cod. Exc.',
          url: '/transbel/interfaz',
          icon: IconListDetails,
        },
      ],
    },
  ],
};

function NavCollapsible() {
  return (
    <>
      {items.navCollapsible.map((item) => (
        <Collapsible key={item.title} title={item.title} defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
            >
              <CollapsibleTrigger>
                {item.title}{' '}
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="pl-4">
                <SidebarMenu>
                  {item.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={true}>
                        <a href={item.url}>
                          {item.icon && <item.icon className="mr-2" />}
                          {item.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );
}

export default NavCollapsible;
