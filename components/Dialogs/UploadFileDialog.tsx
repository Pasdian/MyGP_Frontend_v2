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
import UploadSingleFile from '../UploadSingleFile/UploadSingleFile';

export default function UploadFileDialog({
  setOpen,
  open,
  title,
  folder,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  title: string;
  folder: string;
}) {
  const { clientNumber: client, reference } = useDEAStore((state) => state);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo - {folder}</DialogTitle>
            <DialogDescription>Aquí podras subir un archivo a {title}</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            <UploadSingleFile
              url={`/dea/uploadFile?destination=/GESTION/${client}/${reference}/${folder}`}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
