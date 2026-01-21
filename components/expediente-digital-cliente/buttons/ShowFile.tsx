// ShowFile.tsx
import * as React from 'react';
import useSWR, { mutate } from 'swr';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

type ShowFileProps = {
  path?: string;
  shouldFetch?: boolean;
  className?: string;
};

type FileExistsKey = readonly ['file-exists', string];
type FileExistsSWRKey = FileExistsKey | null;

export const fileExistsKey = (path?: string, shouldFetch: boolean = true): FileExistsSWRKey =>
  shouldFetch && path ? ['file-exists', path] : null;

function openPopup(): Window | null {
  const popup = window.open(
    '',
    '_blank',
    ['popup=yes', 'resizable=yes', 'scrollbars=yes', 'width=1100', 'height=800'].join(',')
  );
  if (!popup) return null;

  try {
    popup.opener = null;
  } catch {}

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family:system-ui;padding:16px">Loading…</body>
    </html>
  `);
  popup.document.close();

  return popup;
}

function buildFileUrl(path: string) {
  const qs = new URLSearchParams({
    path,
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
  } catch (e: any) {
    if (e?.name === 'CanceledError' || e?.name === 'AbortError') return false;
  }

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
  } catch (e: any) {
    if (e?.name === 'CanceledError' || e?.name === 'AbortError') return false;
    return false;
  }
}

function useFileAvailability(path?: string, shouldFetch: boolean = true) {
  const key = fileExistsKey(path, shouldFetch);

  const { data, isLoading } = useSWR<boolean>(
    key,
    async (k) => {
      const [, p] = k as FileExistsKey;
      const controller = new AbortController();
      const url = buildFileUrl(p);
      return checkExistsWithAxios(url, controller.signal);
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

export function revalidateFileExists(path?: string) {
  if (!path) return;
  return mutate(['file-exists', path] as const);
}

export function ShowFile({ path, shouldFetch = true, className }: ShowFileProps) {
  const { available, checking } = useFileAvailability(path, shouldFetch);

  const spawnWindow = React.useCallback(async () => {
    if (!path) return;

    const url = buildFileUrl(path);

    let popup: Window | null = null;
    let blobUrl: string | null = null;

    try {
      const res = await GPClient.get(url, {
        responseType: 'blob',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      popup = openPopup();
      if (!popup) return;

      const contentType = String(res.headers?.['content-type'] || '');
      const blob: Blob = res.data;

      if (contentType.includes('text/html')) {
        const html = await blob.text();
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        return;
      }

      const pdfBlob =
        blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });

      blobUrl = URL.createObjectURL(pdfBlob);
      popup.location.replace(blobUrl);

      const timer = window.setInterval(() => {
        if (popup && popup.closed && blobUrl) {
          clearInterval(timer);
          URL.revokeObjectURL(blobUrl);
        }
      }, 500);
    } catch (e) {
      console.error(e);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      try {
        popup?.close();
      } catch {}
    }
  }, [path]);

  return (
    <div className={`h-8 w-8 flex items-center justify-center shrink-0 ${className ?? ''}`}>
      {!shouldFetch ? null : checking ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : available === true ? (
        <Button
          type="button"
          onClick={spawnWindow}
          className="bg-blue-500 hover:bg-blue-600 h-8 w-8 p-0 flex items-center justify-center"
          aria-label="Abrir archivo"
          title="Abrir archivo"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
export function ShowFileSlot({ className }: { className?: string }) {
  return <div className={`h-8 w-8 shrink-0 ${className ?? ''}`} aria-hidden="true" />;
}
