import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Carousel } from '../ui/carousel';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import UploadFile from '../UploadFiles/UploadFile';
import { FolderKey, getFilesByReference } from '@/types/dea/getFilesByReferences';

export default function UploadFileDialog({
  setOpen,
  open,
  title,
  folder,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  title: string;
  folder: FolderKey;
}) {
  const {
    clientNumber: client,
    reference,
    setFilesByReference,
    filesByReference,
  } = useDEAStore((state) => state);

  const [filename, setFilename] = React.useState('');
  const [successfulUpload, setSuccessfulUpload] = React.useState(false);

  // Update store safely after success
  React.useEffect(() => {
    if (successfulUpload && filename) {
      const base: getFilesByReference = filesByReference ?? {
        files: {
          '01-CTA-GASTOS': [],
          '02-EXPEDIENTE-ADUANAL': [],
          '03-FISCALES': [],
          '04-VUCEM': [],
          '05-EXP-DIGITAL': [],
        },
        message: '',
      };

      const current = base.files[folder];
      if (!current.includes(filename)) {
        setFilesByReference({
          ...base,
          files: { ...base.files, [folder]: [...current, filename] },
          message: base.message,
        });
      }

      setSuccessfulUpload(false);
      setFilename('');
    }
  }, [successfulUpload, filename, folder, filesByReference, setFilesByReference]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo - {folder}</DialogTitle>
            <DialogDescription>Aquí podrás subir un archivo a {title}</DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden">
            <UploadFile
              to={`/GESTION/${client}/${reference}/${folder}`}
              setFilename={setFilename}
              setSuccess={setSuccessfulUpload}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
