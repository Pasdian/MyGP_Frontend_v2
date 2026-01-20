import * as React from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShowFileProps = {
  path?: string;
  shouldFetch?: boolean;
};

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

function buildNoCacheUrl(path: string) {
  const qs = new URLSearchParams({
    path,
    api_key: '91940ba1-ec71-4d4d-bd14-bbde49ce50cc',
    _ts: String(Date.now()),
  });
  return `/expediente-digital-cliente/getFile?${qs.toString()}`;
}

async function checkExists(url: string, signal: AbortSignal): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      signal,
    });

    if (head.ok) return true;
    if (head.status !== 405 && head.status !== 501) return false;
  } catch (e) {
    if ((e as any)?.name === 'AbortError') return false;
  }

  try {
    const range = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Range: 'bytes=0-0',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      signal,
    });

    return range.status === 200 || range.status === 206;
  } catch (e) {
    if ((e as any)?.name === 'AbortError') return false;
    return false;
  }
}

export function ShowFile({ path, shouldFetch = true }: ShowFileProps) {
  const [available, setAvailable] = React.useState<boolean | null>(null);
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();

    if (!shouldFetch) {
      setAvailable(null);
      setChecking(false);
      return () => controller.abort();
    }

    if (!path) {
      setAvailable(false);
      setChecking(false);
      return () => controller.abort();
    }

    setAvailable(null);
    setChecking(true);

    const url = buildNoCacheUrl(path);

    (async () => {
      try {
        const ok = await checkExists(url, controller.signal);
        setAvailable(ok);
      } finally {
        setChecking(false);
      }
    })();

    return () => controller.abort();
  }, [path, shouldFetch]);

  const spawnWindow = React.useCallback(async () => {
    if (!path) return;

    const url = buildNoCacheUrl(path);

    let res: Response;
    try {
      res = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
    } catch (e) {
      console.error(e);
      return;
    }

    if (!res.ok) return;

    const popup = openPopup();
    if (!popup) return;

    let blobUrl: string | null = null;

    try {
      const contentType = res.headers.get('content-type') || '';
      const blob = await res.blob();

      if (contentType.includes('text/html')) {
        popup.document.open();
        popup.document.write(await blob.text());
        popup.document.close();
        return;
      }

      const pdfBlob =
        blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });

      blobUrl = URL.createObjectURL(pdfBlob);
      popup.location.replace(blobUrl);

      const timer = window.setInterval(() => {
        if (popup.closed && blobUrl) {
          clearInterval(timer);
          URL.revokeObjectURL(blobUrl);
        }
      }, 500);
    } catch (e) {
      console.error(e);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      try {
        popup.close();
      } catch {}
    }
  }, [path]);

  // Keep layout: always occupy the first grid column
  if (!shouldFetch) {
    return <div className="h-8 w-8 shrink-0" aria-hidden="true" />;
  }

  if (checking) {
    return (
      <div className="h-8 w-8 shrink-0 flex items-center justify-center" aria-hidden="true">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (available !== true) {
    return <div className="h-8 w-8 shrink-0" aria-hidden="true" />;
  }

  return (
    <Button
      type="button"
      onClick={spawnWindow}
      className="bg-blue-500 hover:bg-blue-600 h-8 w-8 p-0 flex items-center justify-center shrink-0"
      aria-label="Open file"
      title="Open file"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
