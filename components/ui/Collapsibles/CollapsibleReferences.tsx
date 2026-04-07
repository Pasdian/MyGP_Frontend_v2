import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getRefsByClient } from '@/types/casa/getRefsByClient';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '../sidebar';
import { ChevronRight, DownloadIcon } from 'lucide-react';
import { useDEAParams } from '@/hooks/useDEAParams';
import { Input } from '../input';
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
  const { client, reference, startDate, endDate, setReference } = useDEAParams();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isFuzzy, setIsFuzzy] = React.useState(true);
  const isSpecialRefLayout = client === '005009';

  const { refs, isLoading: isRefsLoading } = useRefsByClient(
    client || null,
    startDate,
    endDate
  );

  function handleDownloadZip(clientNumber: string, reference: string) {
    const apiKey = process.env.NEXT_PUBLIC_PYTHON_API_KEY;
    const url = `/pyapi/dea/zip?source=/GESTION/${clientNumber}/${reference}&api_key=${apiKey}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientNumber}-${reference}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  const filterKeys: (keyof getRefsByClient)[] =
    client === '005009' || client === '000259'
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
            <SidebarGroupContent className="pl-2 sm:pl-4">
              <SidebarMenu>
                <Label className="mb-3 text-xs leading-tight">Buscar por Referencia o Pedimento</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isFuzzy}
                    onCheckedChange={(checked) => setIsFuzzy(Boolean(checked))}
                  />
                  <Label className="text-xs">Fuzzy Search</Label>
                </div>
                <Input
                  type="text"
                  placeholder="PAI123456"
                  className="mb-3 h-9 text-sm sm:h-8 sm:text-xs"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />

                {client &&
                  filteredItems.map(
                    ({ NUM_REFE, EE__GE, ADU_DESP, FOLDER_HAS_CONTENT }: getRefsByClient, i) => {
                      const isActive = reference === NUM_REFE;
                      const base = 'cursor-pointer mb-1 px-1 transition-colors duration-150';
                      const active = FOLDER_HAS_CONTENT
                        ? 'bg-blue-500'
                        : 'bg-red-300 cursor-not-allowed opacity-60';
                      const normal = FOLDER_HAS_CONTENT ? 'even:bg-gray-200' : active;

                      return (
                        <SidebarMenuItem
                          key={`${NUM_REFE}-${i}`}
                          className={`min-w-0 overflow-hidden ${base} ${isActive ? active : normal}`}
                          onClick={() => {
                            if (!FOLDER_HAS_CONTENT) return;
                            if (reference === NUM_REFE) return;
                            setReference(NUM_REFE, ADU_DESP);
                            if (isMobile) {
                              setOpenMobile(false);
                            }
                          }}
                        >
                          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <div className="min-w-0 overflow-hidden">
                              {(client === '005009' || client === '000259') && (
                                <p
                                  className={
                                    isActive
                                      ? `min-w-0 overflow-hidden text-slate-100 font-bold ${
                                          isSpecialRefLayout
                                            ? 'break-all text-[12px] leading-4 [overflow-wrap:anywhere]'
                                            : 'break-words'
                                        }`
                                      : `min-w-0 overflow-hidden text-muted-foreground ${
                                          isSpecialRefLayout
                                            ? 'break-all text-[12px] leading-4 [overflow-wrap:anywhere]'
                                            : 'break-words'
                                        }`
                                  }
                                >
                                  {EE__GE}
                                </p>
                              )}
                              <p
                                className={
                                  isActive
                                    ? `min-w-0 overflow-hidden font-bold text-slate-100 ${
                                        isSpecialRefLayout
                                          ? 'break-all text-[13px] leading-4 [overflow-wrap:anywhere]'
                                          : 'break-words text-[13px] sm:text-[14px]'
                                      }`
                                    : `min-w-0 overflow-hidden ${
                                        isSpecialRefLayout
                                          ? 'break-all text-[13px] leading-4 [overflow-wrap:anywhere]'
                                          : 'break-words text-[13px] sm:text-[14px]'
                                      }`
                                }
                              >
                                {NUM_REFE}
                              </p>
                            </div>

                            {FOLDER_HAS_CONTENT && (
                              <PermissionGuard requiredPermissions={[PERM.DEA_DESCARGAR_ARCHIVOS]}>
                                <button
                                  type="button"
                                  aria-label={`Descargar ${NUM_REFE}`}
                                  className={
                                    isActive
                                      ? 'shrink-0 cursor-pointer text-gray-700 text-slate-100 font-bold'
                                      : 'shrink-0 cursor-pointer text-gray-700'
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadZip(client, NUM_REFE);
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
