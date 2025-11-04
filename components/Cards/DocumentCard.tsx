import { Card } from '@/components/ui/card';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { IconUpload } from '@tabler/icons-react';
import UploadFileDialog from '../Dialogs/UploadFileDialog';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { toast } from 'sonner';
import { deaModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import AccessGuard from '../AccessGuard/AccessGuard';
import { FolderKey } from '@/types/dea/getFilesByReferences';
import MyGPSpinner from '../MyGPUI/Spinners/MyGPSpinner';

const deaDownloadFileEvent =
  deaModuleEvents.find((e) => e.alias === 'DEA_DOWNLOAD_FILE')?.eventName || '';
const iconSize = 14;

export default function DocumentCard({
  title,
  files = [],
  onFileSelect,
  activeFile,
  isLoading,
  folder,
  filterFn = () => true,
}: {
  title: string;
  files: string[];
  onFileSelect: (item: string) => void;
  activeFile: string;
  isLoading: boolean;
  filterFn?: (item: string) => boolean;
  folder: FolderKey;
}) {
  const { reference, clientNumber: client } = useDEAStore((state) => state);

  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);

  async function handleDownloadFile(path: string, item: string) {
    // Build a direct URL so the browser owns the download (native progress UI)
    const url = new URL('/dea/downloadFile', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');

    // Trigger native download
    const a = document.createElement('a');
    a.href = url.toString();
    a.download = path; // browser may override with Content-Disposition filename
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Optional: toast to indicate start
    toast.success(`Descargando: ${item}`);
  }

  async function handleDownloadZip(path: string) {
    // Build a direct URL so the browser owns the download (native progress UI)
    const url = new URL('/dea/zip', window.location.origin);
    url.searchParams.set('source', path);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');

    // Trigger native download
    const a = document.createElement('a');
    a.href = url.toString();
    a.download = path; // browser may override with Content-Disposition filename
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Optional: toast to indicate start
    toast.success(`${folder} descargando...`);
  }

  const visibleFiles = (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true));

  return (
    <Card className="rounded-none p-0">
      <div className="grid grid-rows-[auto_1fr] h-full">
        <div className="bg-blue-500 p-1 text-[13px] text-white grid grid-cols-[1fr_auto] items-center gap-2 overflow-x-hidden">
          <p className="min-w-0 break-words overflow-x-hidden font-bold">
            {`${title} - ${visibleFiles.length} archivos`}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <IconUpload
              size={iconSize}
              className="cursor-pointer"
              onClick={() => setOpenUploadDialog(true)}
            />
            {(files?.length ?? 0) > 0 && (
              <DownloadIcon
                size={iconSize}
                className="cursor-pointer"
                onClick={() => handleDownloadZip(`/GESTION/${client}/${reference}/${folder}`)}
              />
            )}
          </div>
        </div>

        <div className="w-full h-full p-1 overflow-y-auto">
          {isLoading && <MyGPSpinner />}
          {!isLoading &&
            visibleFiles.map((item) => {
              const isActive = item === activeFile;
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

                  <AccessGuard allowedPermissions={['DEA_DESCARGAR_ARCHIVOS']}>
                    <DownloadIcon
                      size={iconSize}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFile(
                          `/GESTION/${client}/${reference}/${folder}/${item}`,
                          item
                        );
                        posthog.capture(deaDownloadFileEvent);
                      }}
                    />
                  </AccessGuard>
                </div>
              );
            })}
        </div>
      </div>

      <UploadFileDialog
        open={openUploadDialog}
        setOpen={setOpenUploadDialog}
        title={title}
        folder={folder}
      />
    </Card>
  );
}
