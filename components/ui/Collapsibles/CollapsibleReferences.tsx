import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getRefsByClient } from '@/types/casa/getRefsByClient';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '../sidebar';
import { ChevronRight, DownloadIcon, RefreshCwIcon } from 'lucide-react';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import TailwindSpinner from '../TailwindSpinner';
import useSWR, { mutate } from 'swr';
import { Input } from '../input';
import { getCustomKeyByRef } from '@/lib/customs/customs';

export default function CollapsibleReferences() {
  const {
    reference,
    setReference,
    clientNumber,
    setPdfUrl,
    setFile,
    setCustom,
    getFilesByReferenceKey,
    initialDate,
    finalDate,
  } = useDEAStore((state) => state);

  const [filterValue, setFilterValue] = React.useState('');
  const [url, setUrl] = React.useState('');
  const { data: zipBlob } = useSWR(url, axiosBlobFetcher);
  const [loadingReference, setLoadingReference] = React.useState<string | null>(null);

  const {
    data: allReferences,
    isLoading: isAllReferencesLoading,
  }: { data: getRefsByClient[]; isLoading: boolean } = useSWR(
    clientNumber && initialDate && finalDate
      ? `/dea/getRefsByClient?client=${clientNumber}&initialDate=${
          initialDate.toISOString().split('T')[0]
        }&finalDate=${finalDate.toISOString().split('T')[0]}`
      : `/dea/getRefsByClient?client=000041`,
    axiosFetcher
  );

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

  function fuzzyFilterObjects(
    query: string,
    list: getRefsByClient[],
    keys: (keyof getRefsByClient)[]
  ) {
    if (!list) return;
    const lowerQuery = query.toLowerCase();

    return list.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (typeof value !== 'string') return false;

        const lowerValue = value.toLowerCase();
        let qIndex = 0;

        for (let i = 0; i < lowerValue.length && qIndex < lowerQuery.length; i++) {
          if (lowerValue[i] === lowerQuery[qIndex]) {
            qIndex++;
          }
        }

        return qIndex === lowerQuery.length;
      })
    );
  }

  const filteredItems = fuzzyFilterObjects(filterValue, allReferences, ['NUM_REFE']);

  if (isAllReferencesLoading)
    return (
      <div className="flex justify-center items-center">
        <TailwindSpinner className="h-8 w-8" />
      </div>
    );

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'DEA']}>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
          >
            <CollapsibleTrigger>
              <p className="font-bold">Referencias - {filteredItems?.length || 0} referencias</p>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent className="pl-4">
              <SidebarMenu>
                <Input
                  type="text"
                  placeholder="Buscar..."
                  className="mb-3"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
                {clientNumber &&
                  filteredItems &&
                  filteredItems.map(({ NUM_REFE, FOLDER_EXISTS }: getRefsByClient, i) => {
                    const isDownloading = loadingReference === NUM_REFE;

                    return (
                      <SidebarMenuItem
                        key={i}
                        className={
                          reference === NUM_REFE && FOLDER_EXISTS
                            ? 'bg-green-300 cursor-pointer mb-1 p-2'
                            : !FOLDER_EXISTS
                            ? 'bg-red-400 cursor-not-allowed opacity-60 mb-1 p-2'
                            : 'cursor-pointer mb-1 even:bg-gray-200 p-2'
                        }
                        onClick={() => {
                          if (!FOLDER_EXISTS) return;
                          const custom = getCustomKeyByRef(NUM_REFE);
                          setCustom(custom || '');
                          setPdfUrl('');
                          setFile('');
                          setReference(NUM_REFE);
                        }}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p>{NUM_REFE}</p>
                          </div>
                          <div className="flex">
                            {FOLDER_EXISTS &&
                              (!isDownloading ? (
                                <DownloadIcon
                                  size={20}
                                  className={reference === NUM_REFE && FOLDER_EXISTS ? `mr-2` : ''}
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent triggering parent onClick
                                    setReference(NUM_REFE);
                                    setLoadingReference(NUM_REFE);
                                    setUrl(`/dea/zip/${clientNumber}/${NUM_REFE}`);
                                  }}
                                />
                              ) : (
                                <TailwindSpinner className="w-6 h-6" />
                              ))}
                            {reference === NUM_REFE && FOLDER_EXISTS && (
                              <RefreshCwIcon
                                size={20}
                                onClick={() => mutate(getFilesByReferenceKey)}
                              />
                            )}
                          </div>
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
