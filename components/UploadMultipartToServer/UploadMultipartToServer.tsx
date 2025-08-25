import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';
import { AxiosError } from 'axios';

export default function UploadMultipartToServer({
  apiEndpointPath,
  placeholder,
  mutationKey,
  setOpen,
  open,
}: {
  apiEndpointPath: string;
  placeholder: string;
  mutationKey: string;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  open?: boolean;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [dragActive, setDragActive] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const addFiles = (newFiles: File[]) => {
    if (!newFiles.length) return;
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // only leave when exiting the dropzone, not entering children
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleAreaKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    addFiles(selected);
    // allow re-selecting the same file later
    e.currentTarget.value = '';
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await GPClient.post(apiEndpointPath, formData);
      toast.success(res.data.message);
      setFiles([]);
      if (mutationKey) mutate(mutationKey);
      if (open && setOpen) setOpen(false);
    } catch (error) {
      const err = error as AxiosError<{ message?: string; detail?: string }>;

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Error desconocido';

      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DndContext sensors={sensors}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        // accept="image/png" // uncomment if you want to restrict selection
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Drop / Click area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Seleccionar o arrastrar archivos"
        onClick={handleAreaClick}
        onKeyDown={handleAreaKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
          height: 150,
          border: `2px dashed ${dragActive ? '#2563eb' : '#666'}`, // blue-600 when dragging
          background: dragActive ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#666',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: 20,
          transition: 'border-color 120ms ease, background 120ms ease',
        }}
      >
        <p>{placeholder}</p>
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
