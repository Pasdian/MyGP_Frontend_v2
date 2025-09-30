import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import TailwindSpinner from '../TailwindSpinner';
import useSWRImmutable from 'swr';
import { Input } from '../input';
import { getCustomKeyByRef } from '@/lib/customs/customs';
import AccessGuard from '@/components/AccessGuard/AccessGuard';

export default function CollapsibleReferences() {
  const {
    reference,
    setReference,
    clientNumber,
    setPdfUrl,
    setFile,
    setCustom,
    initialDate,
    finalDate,
  } = useDEAStore((state) => state);

  const [filterValue, setFilterValue] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [loadingReference, setLoadingReference] = React.useState<string | null>(null);

  // Stable SWR key (fetch once per (client, dates))
  const refsKey = React.useMemo(() => {
    if (!clientNumber) return null; // null disables SWR
    const makeDate = (d: Date) => d.toISOString().split('T')[0];

    if (initialDate && finalDate) {
      const i = makeDate(initialDate);
      const f = makeDate(finalDate);
      return `/dea/getRefsByClient?client=${clientNumber}&initialDate=${i}&finalDate=${f}`;
    }
    return `/dea/getRefsByClient?client=${clientNumber}`;
  }, [clientNumber, initialDate, finalDate]);

  const {
    data: allReferences,
    isLoading: isAllReferencesLoading,
  }: { data: getRefsByClient[] | undefined; isLoading: boolean } = useSWRImmutable(
    refsKey,
    axiosFetcher,
    {
      // Make it truly “immutable” unless key changes:
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
      // The initial fetch still happens once per unique key when the cache is empty:
      revalidateOnMount: true,
      // Prevent accidental near-duplicate refetches within this window:
      dedupingInterval: 60 * 60 * 1000,
      shouldRetryOnError: false,
    }
  );

  // ZIP downloading effect
  const { data: zipBlob } = useSWRImmutable(url || null, axiosBlobFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  React.useEffect(() => {
    if (!zipBlob) return;

    try {
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${clientNumber ?? 'client'}-${reference ?? 'refs'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } finally {
      // Reset state so subsequent clicks trigger a fresh fetch
      setUrl('');
      setLoadingReference(null);
    }
  }, [zipBlob, clientNumber, reference]);

  // Fuzzy filter
  function fuzzyFilterObjects(
    query: string,
    list: getRefsByClient[] | undefined,
    keys: (keyof getRefsByClient)[]
  ) {
    if (!list || !query) return list ?? [];
    const lowerQuery = query.toLowerCase();

    return list.filter((item) =>
      keys.some((key) => {
        const value = item[key];
        if (typeof value !== 'string') return false;

        const lowerValue = value.toLowerCase();
        let qIndex = 0;

        for (let i = 0; i < lowerValue.length && qIndex < lowerQuery.length; i++) {
          if (lowerValue[i] === lowerQuery[qIndex]) qIndex++;
        }
        return qIndex === lowerQuery.length;
      })
    );
  }

  const filteredItems = fuzzyFilterObjects(filterValue, allReferences, ['NUM_REFE']);

  if (isAllReferencesLoading) {
    return (
      <div className="flex justify-center items-center">
        <TailwindSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AccessGuard allowedModules={['All Modules', 'DEA']} allowedRoles={['ADMIN', 'DEA']}>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
          >
            <CollapsibleTrigger>
              <p className="font-bold text-xs">{filteredItems?.length || 0} referencias</p>
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
                  filteredItems?.map(({ NUM_REFE, FOLDER_HAS_CONTENT }: getRefsByClient, i) => {
                    const isActive = reference === NUM_REFE;
                    const isDownloading = loadingReference === NUM_REFE;
                    const base =
                      'cursor-pointer mb-1 px-1 transition-colors duration-150 select-none';
                    const active = FOLDER_HAS_CONTENT
                      ? 'bg-green-300'
                      : 'bg-red-400 cursor-not-allowed opacity-60';
                    const normal = FOLDER_HAS_CONTENT ? 'even:bg-gray-200' : active;

                    return (
                      <SidebarMenuItem
                        key={`${NUM_REFE}-${i}`}
                        className={`${base} ${isActive ? active : normal}`}
                        onClick={() => {
                          if (!FOLDER_HAS_CONTENT) return;
                          const custom = getCustomKeyByRef(NUM_REFE);
                          setCustom(custom || '');
                          setPdfUrl('');
                          setFile('');
                          setReference(NUM_REFE);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <p className="max-w-[70px] text-xs truncate">{NUM_REFE}</p>

                          <div className="flex items-center">
                            {FOLDER_HAS_CONTENT &&
                              (!isDownloading ? (
                                <DownloadIcon
                                  size={14}
                                  className="shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation(); // don’t trigger parent onClick
                                    setReference(NUM_REFE);
                                    setLoadingReference(NUM_REFE);
                                    setUrl(`/dea/zip/${clientNumber}/${NUM_REFE}`);
                                  }}
                                />
                              ) : (
                                <TailwindSpinner className="w-6 h-6" />
                              ))}
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
    </AccessGuard>
  );
}
