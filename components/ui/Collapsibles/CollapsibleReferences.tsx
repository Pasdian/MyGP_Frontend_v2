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
import React from 'react';
import { Input } from '../input';
import { getCustomKeyByRef } from '@/lib/customs/customs';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { useRefsByClient } from '@/hooks/useRefsByClient';
import { toast } from 'sonner';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';

export default function CollapsibleReferences() {
  const [filterValue, setFilterValue] = React.useState('');
  const { client, setClient, filters, resetFileState } = useDEAStore((state) => state);
  const { refs, isLoading: isRefsLoading } = useRefsByClient(
    client.number,
    filters.dateRange?.from,
    filters.dateRange?.to
  );

  // Get zip stream
  function handleDownloadZip(clientNumber: string, reference: string) {
    const apiKey = process.env.NEXT_PUBLIC_PYTHON_API_KEY;
    const url = `/dea/zip?source=/GESTION/${clientNumber}/${reference}&api_key=${apiKey}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientNumber}-${reference}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const filteredItems = fuzzyFilterObjects(filterValue, refs, ['NUM_REFE']);
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
  if (isRefsLoading) return <MyGPSpinner />;
  return (
    <AccessGuard allowedRoles={['ADMIN', 'DEA']}>
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

                {client.number &&
                  filteredItems?.map(({ NUM_REFE, FOLDER_HAS_CONTENT }: getRefsByClient, i) => {
                    const isActive = client.reference === NUM_REFE;
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
                          setClient({ custom: custom || '' });
                          setClient({ reference: NUM_REFE });
                          resetFileState();
                        }}
                      >
                        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <p className="min-w-0 text-[14px] break-words">{NUM_REFE}</p>

                          {FOLDER_HAS_CONTENT && (
                            <button
                              type="button"
                              aria-label={`Descargar ${NUM_REFE}`}
                              className="shrink-0 cursor-pointer text-gray-700 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadZip(client.number, NUM_REFE);
                                toast.success(`${NUM_REFE} descargando...`);
                              }}
                              title="Descargar ZIP"
                            >
                              <DownloadIcon size={14} />
                            </button>
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
    </AccessGuard>
  );
}
