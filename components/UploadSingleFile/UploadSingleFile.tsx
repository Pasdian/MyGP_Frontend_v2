import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';

export default function UploadSingleFile({ url }: { url: string }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    // Append filename to URL safely
    const uploadUrl = `${url.replace(/\/$/, '')}/${encodeURIComponent(file.name)}`;

    try {
      const res = await GPClient.post(uploadUrl, formData, {
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            console.log(`Subiendo ${pct}%`);
          }
        },
      });

      toast.success(res.data?.message || 'Archivo subido correctamente');
      setFile(null);
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Error al subir el archivo';
      toast.error(msg);
    } finally {
      setUploading(false);
      const input = document.getElementById('upload-input') as HTMLInputElement;
      if (input) input.value = ''; // reset input
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input id="upload-input" type="file" className="hidden" onChange={handleFileSelect} />

      <Button
        className="bg-blue-500 hover:bg-blue-600"
        disabled={uploading}
        onClick={() => document.getElementById('upload-input')?.click()}
      >
        {file ? `Archivo: ${file.name}` : 'Selecciona un archivo'}
      </Button>

      <Button
        className="bg-green-500 hover:bg-green-600"
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? (
          <div className="flex items-center animate-pulse">
            <LoaderCircle className="animate-spin mr-2" />
            Subiendo...
          </div>
        ) : (
          'Enviar'
        )}
      </Button>
    </div>
  );
}
