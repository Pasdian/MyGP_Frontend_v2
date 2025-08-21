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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import posthog from 'posthog-js';
import { Button } from '../ui/button';

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

  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = React.useState(false);

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

  async function handleDeleteFile() {
    try {
      const res = await GPClient.post(
        `/dea/deleteFile/${client}/${reference}/${folder}/${activeFile}`
      );

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
            {`${title} - ${
              (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true)).length
            } archivos`}
          </p>
          <div>
            {isLoading ? (
              <TailwindSpinner className="w-6 h-6" />
            ) : (files?.length ?? 0) > 0 ? (
              <div className="flex">
                <IconUpload
                  size={20}
                  color="white"
                  className="cursor-pointer mr-2"
                  onClick={() => setOpenUploadDialog(true)}
                />
                <DownloadIcon size={20} className="cursor-pointer" onClick={onDownload} />
              </div>
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
              style={{ maxWidth: '100%' }}
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
                      setOpenDeleteFileDialog(true);
                    }}
                  />
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={openDeleteFileDialog} onOpenChange={setOpenDeleteFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar archivo?</DialogTitle>
            <DialogDescription>
              {activeFile ? `¿Seguro que quieres eliminar "${activeFile}"?` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteFileDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={() => {
                handleDeleteFile();
                posthog.capture(deaDeleteFileEvent);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UploadFileDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        title={title}
        folder={folder}
      />
    </Card>
  );
}
