import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Carousel } from '../ui/carousel';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import React from 'react';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { toast } from 'sonner';
import { mutate } from 'swr';

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
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Carousel>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir archivo - {folder}</DialogTitle>
            <DialogDescription>Aquí podras subir un archivo a {title}</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            <FileDragAndUpload folder={folder} />
          </div>
        </DialogContent>
      </Carousel>
    </Dialog>
  );
}

function FileDragAndUpload({ folder }: { folder: string }) {
  const { clientNumber: client, reference, getFilesByReferenceKey } = useDEAStore((state) => state);

  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    await GPClient.post(`/dea/uploadFile/${client}/${reference}/${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((res) => {
        toast.success(res.data.message);
        setFiles([]);
        setUploading(false);
        mutate(getFilesByReferenceKey);
      })
      .catch((error) => {
        toast.error(error.response?.data?.detail || 'Error desconocido');
      });
  };

  return (
    <DndContext sensors={sensors}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          height: 150,
          border: '2px dashed #666',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#666',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: 20,
        }}
      >
        <p>Arrastra y suelta archivos aquí</p>
        {files.length > 0 && (
          <ul
            style={{
              maxHeight: 100,
              overflowY: 'auto',
              marginTop: 10,
              width: '90%',
              textAlign: 'center',
            }}
          >
            {files.map((file, idx) => (
              <li key={idx}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button
        className="bg-blue-500 hover:bg-blue-600 cursor-pointer"
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? (
          <div className="flex items-center animate-pulse">
            <LoaderCircle className="animate-spin mr-2" />
            Cargando
          </div>
        ) : (
          'Subir archivos'
        )}
      </Button>
      {message && <p>{message}</p>}
    </DndContext>
  );
}
