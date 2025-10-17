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

const deaDownloadFileEvent =
  deaModuleEvents.find((e) => e.alias === 'DEA_DOWNLOAD_FILE')?.eventName || '';
const iconSize = 14;

export default function DocumentCard({
  title,
  files = [],
  onFileSelect,
  activeFile,
  folder,
  className = '',
  filterFn = () => true,
}: {
  title: string;
  files: string[];
  onFileSelect: (item: string) => void;
  activeFile: string;
  className?: string;
  filterFn?: (item: string) => boolean;
  folder: string;
}) {
  const { reference, clientNumber: client } = useDEAStore((state) => state);

  const cardClassName = 'py-0 rounded-none h-full min-h-0 overflow-hidden';
  const wrapperClassName = 'h-full flex flex-col min-h-0';
  const stickyClassName =
    'sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center z-10';
  const listClassName =
    'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-2 text-[10px]';

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
    toast.success(`${folder} descargado`);
  }

  const visibleFiles = (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true));

  return (
    <Card className={`${cardClassName} ${className}`}>
      <div className={wrapperClassName}>
        <div className={stickyClassName}>
          <p className="font-bold">{`${title} - ${visibleFiles.length} archivos`}</p>
          <div>
            <div className="flex">
              <IconUpload
                size={iconSize}
                color="white"
                className="cursor-pointer mr-2"
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
        </div>

        <div className={listClassName}>
          {visibleFiles.map((item) => {
            const isActive = item === activeFile;
            const isPedimentoSimplificado = item.includes('PSIM');

            return (
              <div
                key={item}
                className={`flex justify-between p-1 items-center cursor-pointer mb-1 ${
                  isActive
                    ? 'bg-green-300'
                    : isPedimentoSimplificado
                    ? 'bg-yellow-200'
                    : 'even:bg-gray-100'
                }`}
                onClick={() => onFileSelect(item)}
              >
                <div className="max-w-[80%] truncate">
                  <p className="truncate">{item}</p>
                </div>
                <div className="flex">
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
