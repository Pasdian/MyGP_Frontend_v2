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

  async function handleDownloadFile(path: string, item: string) {
    const url = new URL('/dea/downloadFile', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');

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
    const url = new URL('/dea/zip', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');

    const a = document.createElement('a');
    a.href = url.toString();
    a.download = path;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    toast.success(`${currentFolder} descargando...`);
  }

  const visibleFiles = (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true));

  return (
    <Card className="rounded-none p-0 h-full min-h-0">
      <div className="grid grid-rows-[auto_1fr] h-full min-h-0">
        <div className="bg-blue-500 p-1 text-[13px] text-white grid grid-cols-[1fr_auto] items-center gap-2 overflow-x-hidden">
          <p className="min-w-0 break-words overflow-x-hidden font-bold">
            {`${title} - ${visibleFiles.length} archivos`}
          </p>

          <div className="flex items-center gap-2 shrink-0">
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

        <div className="w-full h-full p-1 overflow-y-auto min-h-0">
          {isLoading && <MyGPSpinner />}
          {!isLoading &&
            visibleFiles.map((item) => {
              const isActive = item === file.activeFile;
              const isPedimentoSimplificado = item.includes('PSIM');

              return (
                <div
                  key={item}
                  className={`flex justify-between items-center cursor-pointer mb-1 p-1 ${
                    isActive
                      ? 'bg-green-300'
                      : isPedimentoSimplificado
                      ? 'bg-yellow-200'
                      : 'even:bg-gray-100'
                  }`}
                  onClick={() => onFileSelect(item)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] break-words">{item}</p>
                  </div>

                  <PermissionGuard requiredPermissions={[PERM.DEA_DESCARGAR_ARCHIVOS]}>
                    <DownloadIcon
                      size={iconSize}
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
