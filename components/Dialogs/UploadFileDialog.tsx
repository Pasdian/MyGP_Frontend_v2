import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Carousel } from '../ui/carousel';
import { useDEAParams } from '@/hooks/useDEAParams';
import { useDEAContext } from '@/app/providers/dea-store-provider';
import UploadFile from '../UploadFiles/UploadFile';
import { FolderKey } from '@/types/dea/getFilesByReferences';

export default function UploadFileDialog({
  setOpen,
  open,
  title,
  currentFolder,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  title: string;
  currentFolder: FolderKey;
}) {
  const { client, reference } = useDEAParams();
  const { filesByReference, setFilesByReference } = useDEAContext();

  const [filename, setFilename] = React.useState('');
  const [successfulUpload, setSuccessfulUpload] = React.useState(false);

  // Update store safely after success (optimistic merge)
  React.useEffect(() => {
    if (successfulUpload && filename) {
      const base = filesByReference ?? { message: '', files: {} };
      const files = base.files ?? {};

      const selectedFolder = currentFolder || 'SIN_CLASIFICAR';
      const currentFiles = files[selectedFolder] || [];

      if (!currentFiles.includes(filename)) {
        setFilesByReference({
          ...base,
          files: {
            ...files,
            [currentFolder]: [...currentFiles, filename],
          },
        });
      }

      setSuccessfulUpload(false);
      setFilename('');
    }
  }, [successfulUpload, filename, currentFolder, filesByReference, setFilesByReference]);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo - {currentFolder}</DialogTitle>
            <DialogDescription>Aquí podrás subir un archivo a {title}</DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden">
            <UploadFile
              to={`/GESTION/${client}/${reference}/${currentFolder}`}
              setFilename={setFilename}
              setSuccess={setSuccessfulUpload}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
