import * as React from 'react';
import useSWR, { mutate } from 'swr';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';

type ShowFileProps = {
  client: string;
  docKey?: string;
  className?: string;
  disabled?: boolean;
};

type FileExistsKey = readonly ['file-exists', string, string];
type FileExistsSWRKey = FileExistsKey | null;

const fileExistsKey = (client?: string, docKey?: string): FileExistsSWRKey =>
  client && docKey ? ['file-exists', client, docKey] : null;

function buildFileUrl(client: string, docKey: string) {
  const qs = new URLSearchParams({
    client,
    docKey,
    _ts: String(Date.now()),
  });

  return `/expediente-digital-cliente/getFile?${qs.toString()}`;
}

async function checkExistsWithAxios(url: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const head = await GPClient.request({
      url,
      method: 'HEAD',
      signal,
      validateStatus: () => true,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (head.status >= 200 && head.status < 300) return true;
    if (head.status !== 405 && head.status !== 501) return false;
  } catch {}

  try {
    const range = await GPClient.request({
      url,
      method: 'GET',
      signal,
      validateStatus: () => true,
      headers: {
        Range: 'bytes=0-0',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    return range.status === 200 || range.status === 206;
  } catch {
    return false;
  }
}

function openPopup(): Window | null {
  const popup = window.open(
    '',
    '_blank',
    'popup=yes,resizable=yes,scrollbars=yes,width=1100,height=800'
  );
  if (!popup) return null;

  try {
    popup.opener = null;
  } catch {}

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Cargando…</title>
        <style>
          html, body {
            height: 100%;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: white;
            font-family: system-ui, sans-serif;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(255,255,255,0.2);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="spinner" aria-label="Cargando"></div>
      </body>
    </html>
  `);
  popup.document.close();

  return popup;
}

function useFileAvailability(client?: string, docKey?: string) {
  const key = fileExistsKey(client, docKey);

  const { data, isLoading } = useSWR<boolean>(
    key,
    async (k) => {
      const [, c, d] = k as FileExistsKey;
      const controller = new AbortController();
      return checkExistsWithAxios(buildFileUrl(c, d), controller.signal);
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    available: key ? data : null,
    checking: Boolean(key) && isLoading,
  };
}

export function revalidateFileExists(client: string, docKey: string) {
  return mutate(['file-exists', client, docKey] as const);
}

export function ShowFile({ client, docKey, className, disabled = false }: ShowFileProps) {
  const [isOpening, setIsOpening] = React.useState(false);

  const { available, checking } = useFileAvailability(client, docKey);

  const canOpen = Boolean(docKey) && available === true && !disabled && !checking && !isOpening;

  const openFile = React.useCallback(async () => {
    if (!client || !docKey) return;
    if (!canOpen) return;

    setIsOpening(true);

    const url = buildFileUrl(client, docKey);
    const popup = openPopup();
    if (!popup) {
      setIsOpening(false);
      return;
    }

    let blobUrl: string | null = null;

    try {
      const res = await GPClient.get(url, {
        responseType: 'blob',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      blobUrl = URL.createObjectURL(res.data);
      popup.location.replace(blobUrl);

      const timer = setInterval(() => {
        if (popup.closed && blobUrl) {
          clearInterval(timer);
          URL.revokeObjectURL(blobUrl);
        }
      }, 500);
    } catch (e) {
      console.error(e);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      popup.close();
    } finally {
      setIsOpening(false);
    }
  }, [client, docKey, canOpen]);

  return (
    <div className={`h-8 w-8 flex items-center justify-center ${className ?? ''}`}>
      {checking || isOpening ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Button
          type="button"
          onClick={openFile}
          disabled={!canOpen}
          className="bg-blue-500 cursor-pointer hover:bg-blue-600 h-8 w-8 p-0"
          title={canOpen ? 'Abrir archivo' : 'No disponible'}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
