import { Card } from '@/components/ui/card';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { IconUpload } from '@tabler/icons-react';
import UploadFileDialog from '../Dialogs/UploadFileDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { toast } from 'sonner';
import { deaModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { FolderKey } from '@/types/dea/getFilesByReferences';
import MyGPSpinner from '../MyGPUI/Spinners/MyGPSpinner';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { Input } from '../ui/input';

const deaDownloadFileEvent =
  deaModuleEvents.find((e) => e.alias === 'DEA_DOWNLOAD_FILE')?.eventName || '';
const iconSize = 14;

type DocumentCardProps = {
  title: string;
  files: string[];
  onFileSelect: (item: string) => void;
  isLoading: boolean;
  filterFn?: (item: string) => boolean;
  currentFolder: FolderKey;
  className?: string;
};

function fuzzyMatch(query: string, text: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = text.toLowerCase();

  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

export default function DocumentCard({
  title,
  files = [],
  onFileSelect,
  isLoading,
  currentFolder,
  filterFn = () => true,
}: DocumentCardProps) {
  const { client, file } = useDEAStore((state) => state);

  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [query, setQuery] = React.useState('');

  async function handleDownloadFile(path: string, item: string) {
    const url = new URL('/pyapi/dea/downloadFile', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');
    url.searchParams.set('_ts', String(Date.now()));

    const a = document.createElement('a');
    a.href = url.toString();
    a.download = path;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    toast.success(`Descargando: ${item}`);
  }

  async function handleDownloadZip(path: string) {
    const url = new URL('/pyapi/dea/zip', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');
    url.searchParams.set('_ts', String(Date.now()));

    const a = document.createElement('a');
    a.href = url.toString();
    a.download = path;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    toast.success(`${currentFolder} descargando...`);
  }

  const baseVisibleFiles = (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true));

  const visibleFiles = baseVisibleFiles
    .filter((item) => fuzzyMatch(query, item))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return (
    <Card className="h-full min-h-[16rem] rounded-none p-0">
      <div className="grid grid-rows-[auto_auto_1fr] h-full min-h-0">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 overflow-x-hidden bg-blue-500 p-2 text-xs text-white sm:p-1 sm:text-[13px]">
          <p className="min-w-0 overflow-x-hidden break-words font-bold leading-tight">
            {`${title} - ${visibleFiles.length} archivos`}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <PermissionGuard requiredPermissions={[PERM.DEA_SUBIR_ARCHIVOS]}>
              <IconUpload
                size={iconSize}
                className="cursor-pointer"
                onClick={() => setOpenUploadDialog(true)}
              />
            </PermissionGuard>

            {(files?.length ?? 0) > 0 && (
              <PermissionGuard requiredPermissions={[PERM.DEA_DESCARGAR_ARCHIVOS]}>
                <DownloadIcon
                  size={iconSize}
                  className="cursor-pointer"
                  onClick={() =>
                    handleDownloadZip(
                      `/GESTION/${client.number}/${client.reference}/${currentFolder}`
                    )
                  }
                />
              </PermissionGuard>
            )}
          </div>
        </div>

        {/* Fuzzy find input  */}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar archivo..."
          className="h-8 w-full rounded-none px-2 text-xs sm:h-7 sm:py-0.5 sm:!text-[12px]"
        />
        <div className="h-full min-h-0 w-full overflow-y-auto p-1.5 sm:p-1">
          {isLoading && <MyGPSpinner />}

          {!isLoading &&
            visibleFiles.map((item) => {
              const isActive = item === file.activeFile;
              const isPedimentoSimplificado = item.includes('PSIM');

              return (
                <div
                  key={item}
                  className={`mb-1 flex cursor-pointer items-start justify-between gap-2 rounded-sm p-1.5 sm:items-center sm:p-1 ${
                    isActive
                      ? 'bg-green-100 text-slate-900 font-semibold'
                      : isPedimentoSimplificado
                        ? 'bg-yellow-100 hover:bg-yellow-200'
                        : 'even:bg-gray-100 hover:bg-slate-300'
                  }`}
                  onClick={() => onFileSelect(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="break-words text-xs leading-4 sm:text-[11px]">{item}</p>
                  </div>

                  <PermissionGuard requiredPermissions={[PERM.DEA_DESCARGAR_ARCHIVOS]}>
                    <DownloadIcon
                      size={iconSize}
                      className="mt-0.5 shrink-0 sm:mt-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(
                          `/GESTION/${client.number}/${client.reference}/${currentFolder}/${item}`,
                          item
                        );
                        posthog.capture(deaDownloadFileEvent);
                      }}
                    />
                  </PermissionGuard>
                </div>
              );
            })}
        </div>
      </div>

      <UploadFileDialog
        open={openUploadDialog}
        setOpen={setOpenUploadDialog}
        title={title}
        currentFolder={currentFolder}
      />
    </Card>
  );
}
