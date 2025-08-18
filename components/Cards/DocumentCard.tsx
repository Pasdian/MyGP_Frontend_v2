import { Card } from '@/components/ui/card';
import { DownloadIcon, Trash2Icon } from 'lucide-react';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import React from 'react';
import { IconUpload } from '@tabler/icons-react';
import UploadFileDialog from '../Dialogs/UploadFileDialog';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { toast } from 'sonner';
import { mutate } from 'swr';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import { deaModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';

const deaDownloadFileEvent =
  deaModuleEvents.find((e) => e.alias === 'DEA_DOWNLOAD_FILE')?.eventName || '';
const deaDeleteFileEvent =
  deaModuleEvents.find((e) => e.alias === 'DEA_DELETE_FILE')?.eventName || '';

export default function DocumentCard({
  title,
  files = [],
  isLoading,
  onDownload,
  onFileSelect,
  activeFile,
  folder,
  filterFn = () => true,
}: {
  title: string;
  files: string[];
  isLoading: boolean;
  onDownload: () => void;
  onFileSelect: (item: string) => void;
  activeFile: string;
  filterFn?: (item: string) => void;
  folder: string;
}) {
  const { reference, clientNumber: client, getFilesByReferenceKey } = useDEAStore((state) => state);

  const cardClassName = 'h-[240px] py-0 rounded-md';
  const cardHeaderClassName = 'h-full overflow-y-auto text-xs';
  const stickyClassName =
    'sticky top-0 bg-blue-500 p-2 text-white flex justify-between items-center';

  const [openDialog, setOpenDialog] = React.useState(false);

  async function handleDownloadFile(file: string) {
    try {
      const res = await GPClient.post(
        `/dea/downloadFile/${client}/${reference}/${folder}/${file}`,
        null,
        { responseType: 'blob' }
      );

      if (res.status !== 200) {
        toast.error(`Error al descargar el archivo (${res.status})`);
        return;
      }

      let downloadName = file;
      const disposition = res.headers['content-disposition'];

      if (disposition) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match?.[1]) downloadName = match[1];
      }

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el archivo');
    }
  }

  async function handleDeleteFile(file: string) {
    try {
      const res = await GPClient.post(`/dea/deleteFile/${client}/${reference}/${folder}/${file}`);

      if (res.status !== 200) {
        toast.error(`Error al eliminar el archivo (${res.status})`);
        return;
      }

      toast.success(res.data.message);
      mutate(getFilesByReferenceKey);
    } catch {
      toast.error('Error al descargar el archivo');
    }
  }

  return (
    <Card className={cardClassName}>
      <div className={cardHeaderClassName}>
        <div className={stickyClassName}>
          <p className="font-bold">
            {title} - {files.filter(filterFn).length} archivos
          </p>
          <div>
            {files.length > 0 && !isLoading ? (
              <div className="flex">
                <IconUpload
                  size={20}
                  color="white"
                  className="cursor-pointer mr-2"
                  onClick={() => setOpenDialog(true)}
                />
                <DownloadIcon size={20} className="cursor-pointer" onClick={onDownload} />
              </div>
            ) : isLoading ? (
              <TailwindSpinner className="w-6 h-6" />
            ) : null}
          </div>
        </div>
        <div className="p-2">
          {files.filter(filterFn).map((item) => (
            <div
              key={item}
              className={`flex justify-between p-1 items-center cursor-pointer mb-1 even:bg-gray-200 ${
                item === activeFile ? 'bg-green-300' : ''
              }`}
              onClick={() => onFileSelect(item)}
              style={{ maxWidth: '100%' }} // asegurar ancho máximo si necesario
            >
              <div className="max-w-[70%]">
                <p className="break-words">{item}</p>
              </div>
              <div className="flex">
                <PermissionGuard allowedPermissions={['DEA_DESCARGAR_ARCHIVOS']}>
                  <DownloadIcon
                    className="mr-2"
                    size={20}
                    onClick={() => {
                      handleDownloadFile(item);
                      posthog.capture(deaDownloadFileEvent);
                    }}
                  />
                </PermissionGuard>
                <PermissionGuard allowedPermissions={['DEA_BORRAR_ARCHIVOS']}>
                  <Trash2Icon
                    size={20}
                    onClick={() => {
                      handleDeleteFile(item);
                      posthog.capture(deaDeleteFileEvent);
                    }}
                  />
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      </div>
      <UploadFileDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title={title}
        folder={folder}
      />
    </Card>
  );
}
