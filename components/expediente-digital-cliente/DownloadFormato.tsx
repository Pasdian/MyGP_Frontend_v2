import axios from 'axios';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function DownloadFormato({ doc }: { doc: string }) {
  const downloadEncomienda = async () => {
    try {
      const res = await axios.get(
        `/formatos?doc=${doc}&api_key=91940ba1-ec71-4d4d-bd14-bbde49ce50cc`,
        { responseType: 'blob' }
      );

      const cd = res.headers?.['content-disposition'] || '';
      const match = cd.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i);
      const filename = match ? decodeURIComponent(match[1]) : `${doc}.pdf`;

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Documento descargado correctamente');
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      let detail = 'Error al descargar el documento';

      try {
        if (data instanceof Blob) {
          const text = await data.text();
          const json = JSON.parse(text);
          detail = json?.detail || detail;
        } else if (data?.detail) {
          detail = data.detail;
        }
      } catch {
        // ignore parse errors
      }

      toast.error(detail);

      console.error('Download failed', err);
    }
  };

  return <Download size={20} className="cursor-pointer" onClick={downloadEncomienda} />;
}
