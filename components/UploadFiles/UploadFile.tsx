import * as React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';

export default function UploadFile({
  to,
  url,
  setSuccess,
  setFilename,
  onUploaded,
}: {
  to: string;
  url?: string;
  setSuccess?: React.Dispatch<React.SetStateAction<boolean>>;
  setFilename?: React.Dispatch<React.SetStateAction<string>>;
  onUploaded?: () => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFilename?.(f?.name ?? '');
    setSuccess?.(false);
    // allow reselecting the same file
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (uploading) return;
    if (!file) return toast.error('Selecciona un archivo primero');
    if (!to.startsWith('/')) return toast.error('La ruta destino debe iniciar con "/"');

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await GPClient.post(url ?? '/dea/uploadFile', formData, {
        params: { destination: to },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data?.detail || `Archivo "${file.name}" subido correctamente`);
      setSuccess?.(true);
      onUploaded?.();
      setFile(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail || err.response?.data?.message || err.message
        : (err as Error).message;
      toast.error(msg || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 w-[340px]">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      <Button
        className="bg-blue-500 hover:bg-blue-600 w-full justify-start text-left px-3 overflow-hidden"
        disabled={uploading}
        size="sm"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <span className="min-w-0 block truncate overflow-hidden whitespace-nowrap text-ellipsis">
          {file ? `Archivo: ${file.name}` : 'Selecciona un archivo'}
        </span>
      </Button>

      <Button
        className="bg-green-500 hover:bg-green-600"
        disabled={!file || uploading}
        size="sm"
        onClick={handleUpload}
      >
        {uploading ? (
          <div className="flex items-center animate-pulse">
            <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
            Subiendo...
          </div>
        ) : (
          'Enviar'
        )}
      </Button>
    </div>
  );
}
