import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Carousel } from '../ui/carousel';
import React from 'react';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import UploadMultipartToServer from '../UploadMultipartToServer/UploadMultipartToServer';

export default function UploadFileDialog({
  onOpenChange,
  open,
  title,
  folder,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
  folder: string;
}) {
  const { clientNumber: client, reference, getFilesByReferenceKey } = useDEAStore((state) => state);
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo - {folder}</DialogTitle>
            <DialogDescription>Aquí podras subir un archivo a {title}</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            <UploadMultipartToServer
              apiEndpointPath={`/dea/uploadFiles/${client}/${reference}/${folder}`}
              placeholder="Arrastra o da click aquí para subir archivos"
              mutationKey={getFilesByReferenceKey}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
