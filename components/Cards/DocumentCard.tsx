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
const iconSize = 14;

export default function DocumentCard({
  title,
  files = [],
  isLoading,
  onDownload,
  onFileSelect,
  activeFile,
  folder,
  className = '',
  filterFn = () => true,
}: {
  title: string;
  files: string[];
  isLoading: boolean;
  onDownload: () => void;
  onFileSelect: (item: string) => void;
  activeFile: string;
  className?: string;
  filterFn?: (item: string) => boolean;
  folder: string;
}) {
  const { reference, clientNumber: client, getFilesByReferenceKey } = useDEAStore((state) => state);

  // ✅ Key layout fixes:
  // - Card gets min-h-0 + overflow-hidden to contain internals
  // - Wrapper remains flex-col + min-h-0
  // - List becomes flex-1 so it takes remaining space and scrolls internally
  const cardClassName = 'py-0 rounded-md h-full min-h-0 overflow-hidden';
  const wrapperClassName = 'h-full flex flex-col min-h-0';
  const stickyClassName =
    'sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center z-10';
  const listClassName =
    'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-2 text-[10px]';

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

  const visibleFiles = (Array.isArray(files) ? files : []).filter(filterFn ?? (() => true));

  return (
    <Card className={`${cardClassName} ${className}`}>
      <div className={wrapperClassName}>
        <div className={stickyClassName}>
          <p className="font-bold">{`${title} - ${visibleFiles.length} archivos`}</p>
          <div>
            {isLoading ? (
              <TailwindSpinner className="w-6 h-6" />
            ) : (files?.length ?? 0) > 0 ? (
              <div className="flex">
                <IconUpload
                  size={iconSize}
                  color="white"
                  className="cursor-pointer mr-2"
                  onClick={() => setOpenUploadDialog(true)}
                />
                <DownloadIcon size={iconSize} className="cursor-pointer" onClick={onDownload} />
              </div>
            ) : null}
          </div>
        </div>

        {/* ✅ This area now expands and scrolls instead of overflowing */}
        <div className={listClassName}>
          {visibleFiles.map((item) => (
            <div
              key={item}
              className={`flex justify-between p-1 items-center cursor-pointer mb-1 even:bg-gray-100 ${
                item === activeFile ? 'bg-green-300' : ''
              }`}
              onClick={() => onFileSelect(item)}
            >
              <div className="max-w-[70%]">
                <p className="break-words">{item}</p>
              </div>
              <div className="flex">
                <PermissionGuard allowedPermissions={['DEA_DESCARGAR_ARCHIVOS']}>
                  <DownloadIcon
                    className="mr-2"
                    size={iconSize}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(item);
                      posthog.capture(deaDownloadFileEvent);
                    }}
                  />
                </PermissionGuard>
                <PermissionGuard allowedPermissions={['DEA_BORRAR_ARCHIVOS']}>
                  <Trash2Icon
                    size={iconSize}
                    onClick={(e) => {
                      e.stopPropagation();
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
                setOpenDeleteFileDialog(false);
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
