import React from 'react';
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
import { Input } from '../input';
import { getCustomKeyByRef } from '@/lib/customs/customs';
import { useRefsByClient } from '@/hooks/useRefsByClient';
import { toast } from 'sonner';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { Label } from '../label';
import { Checkbox } from '../checkbox';

function exactMatchFilter(
  query: string,
  list: getRefsByClient[] | undefined,
  keys: (keyof getRefsByClient)[]
) {
  if (!list) return [];
  const q = query.trim().toLowerCase();
  if (!q) return list;

  return list.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase() === q;
    })
  );
}

function fuzzyFilter(
  query: string,
  list: getRefsByClient[] | undefined,
  keys: (keyof getRefsByClient)[]
) {
  if (!list) return [];
  const q = query.trim().toLowerCase();
  if (!q) return list;

  return list.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return typeof value === 'string' && value.toLowerCase().includes(q);
    })
  );
}

export default function CollapsibleReferences() {
  const [filterValue, setFilterValue] = React.useState('');
  const { client, setClient, filters, resetFileState } = useDEAStore((state) => state);
  const [isFuzzy, setIsFuzzy] = React.useState(true);

  const { refs, isLoading: isRefsLoading } = useRefsByClient(
    client.number,
    filters.dateRange?.from,
    filters.dateRange?.to
  );

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
  const filterKeys: (keyof getRefsByClient)[] =
    client.number === '005009' || client.number == '000259'
      ? (['EE__GE', 'NUM_REFE'] as const)
      : (['NUM_REFE', 'NUM_PEDI'] as const);

  const filteredItems = isFuzzy
    ? fuzzyFilter(filterValue, refs, filterKeys)
    : exactMatchFilter(filterValue, refs, filterKeys);

  if (isRefsLoading) return <MyGPSpinner />;

  return (
    <div>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel
            asChild
            className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
          >
            <CollapsibleTrigger>
              <p className="font-bold text-xs">{filteredItems.length} referencias</p>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>

          <CollapsibleContent>
            <SidebarGroupContent className="pl-4">
              <SidebarMenu>
                <Label className="mb-4">Buscar por Referencia o Pedimento</Label>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    checked={isFuzzy}
                    onCheckedChange={(checked) => setIsFuzzy(Boolean(checked))}
                  />
                  <Label className="text-xs">Fuzzy Search</Label>
                </div>
                <Input
                  type="text"
                  placeholder="PAI123456"
                  className="mb-3"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />

                {client.number &&
                  filteredItems.map(
                    ({ NUM_REFE, EE__GE, FOLDER_HAS_CONTENT }: getRefsByClient, i) => {
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

                            if (client.reference === NUM_REFE) {
                              return;
                            }

                            const custom = getCustomKeyByRef(NUM_REFE) || '';

                            setClient({ reference: NUM_REFE, custom });
                            resetFileState();
                          }}
                        >
                          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                            <div>
                              {(client.number == '005009' || client.number == '000259') && (
                                <p className="text-slate-500">{EE__GE}</p>
                              )}
                              <p className="min-w-0 text-[14px] break-words">{NUM_REFE}</p>
                            </div>

                            {FOLDER_HAS_CONTENT && (
                              <PermissionGuard requiredPermissions={[PERM.DEA_DESCARGAR_ARCHIVOS]}>
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
                              </PermissionGuard>
                            )}
                          </div>
                        </SidebarMenuItem>
                      );
                    }
                  )}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </div>
  );
}
