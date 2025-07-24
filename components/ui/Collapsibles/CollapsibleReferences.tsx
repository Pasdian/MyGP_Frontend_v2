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
import { ChevronRight, DownloadIcon } from 'lucide-react';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { axiosBlobFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import TailwindSpinner from '../TailwindSpinner';
import useSWRImmutable from 'swr/immutable';

export default function CollapsibleReferences({ references }: { references: getRefsByClient[] }) {
  const { reference, setClickedReference, clientNumber } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');

  const { data: zipBlob } = useSWRImmutable(url, axiosBlobFetcher);
  const [loadingReference, setLoadingReference] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!zipBlob) return;
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${clientNumber}-${reference}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setUrl('');
    setLoadingReference('');
    URL.revokeObjectURL(downloadUrl);

    // Reset URL to allow re-download on next click
    setUrl('');
  }, [zipBlob, clientNumber, reference]);

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
                {clientNumber &&
                  references &&
                  references.map(({ NUM_REFE }: getRefsByClient, i) => {
                    const isDownloading = loadingReference === NUM_REFE;

                    return (
                      <SidebarMenuItem
                        key={i}
                        className={
                          reference == NUM_REFE
                            ? 'bg-green-300 cursor-pointer mb-1 p-2'
                            : 'cursor-pointer mb-1 even:bg-gray-200 p-2'
                        }
                        onClick={() => setClickedReference(NUM_REFE)}
                      >
                        <div className="flex justify-between">
                          <p>{NUM_REFE}</p>
                          {!isDownloading ? (
                            <DownloadIcon
                              size={20}
                              onClick={() => {
                                setClickedReference(NUM_REFE);
                                setLoadingReference(NUM_REFE);
                                setUrl(`/dea/zip/${clientNumber}/${NUM_REFE}`);
                              }}
                            />
                          ) : (
                            <TailwindSpinner className="w-6 h-6" />
                          )}
                        </div>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </ProtectedRoute>
  );
}
