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
  const { client, file, setFile } = useDEAStore((state) => state);

  const [filename, setFilename] = React.useState('');
  const [successfulUpload, setSuccessfulUpload] = React.useState(false);

  // Update store safely after success (supports legacy + new shapes)
  React.useEffect(() => {
    if (successfulUpload && filename) {
      // Ensure base structure exists
      const base = file.filesByReference ?? { message: '', files: {} };
      const files = base.files ?? {};

      // Ensure folder exists
      const selectedFolder = currentFolder || 'SIN_CLASIFICAR';
      const currentFiles = files[selectedFolder] || [];

      // Add new file if not already there
      if (!currentFiles.includes(filename)) {
        setFile({
          ...file,
          filesByReference: {
            ...base,
            files: {
              ...files,
              [currentFolder]: [...currentFiles, filename],
            },
          },
        });
      }

      // Reset flags
      setSuccessfulUpload(false);
      setFilename('');
    }
  }, [successfulUpload, filename, currentFolder, file, setFile]);
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
              to={`/GESTION/${client.number}/${client.reference}/${currentFolder}`}
              setFilename={setFilename}
              setSuccess={setSuccessfulUpload}
            />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}
