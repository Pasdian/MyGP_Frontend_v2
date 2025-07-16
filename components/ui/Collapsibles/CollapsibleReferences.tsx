import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import { getRefsByClient } from '@/types/casa/getRefsByClient';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '../sidebar';
import { ChevronRight } from 'lucide-react';
import { useDEAStore } from '@/app/providers/dea-store-provider';

export default function CollapsibleReferences({
  clientNumber,
  references,
  isLoading,
}: {
  clientNumber: string;
  references: getRefsByClient[];
  isLoading: boolean;
}) {
  const { reference: clickedReference, setClickedReference } = useDEAStore((state) => state);

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
          >
            <CollapsibleTrigger>
              <p className="font-bold">Referencias</p>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="pl-4">
              <SidebarMenu>
                {clientNumber && references && !isLoading
                  ? references.map((reference, i) => {
                      return (
                        <SidebarMenuItem
                          key={i}
                          className={
                            clickedReference == reference.NUM_REFE
                              ? 'bg-green-300 cursor-pointer mb-1'
                              : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
                          }
                        >
                          <p onClick={() => setClickedReference(reference.NUM_REFE)}>
                            {reference.NUM_REFE}
                          </p>
                        </SidebarMenuItem>
                      );
                    })
                  : ''}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </ProtectedRoute>
  );
}
