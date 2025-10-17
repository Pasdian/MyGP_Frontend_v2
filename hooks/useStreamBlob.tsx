import * as React from 'react';

type UseStreamedFileBlobOpts = {
  apiKey?: string;
  credentials?: RequestCredentials; // 'include' by default
  onProgress?: (received: number, total?: number) => void;
};

type UseStreamedFileBlobResult = {
  blobUrl: string | null;
  blob?: Blob;
  isLoading: boolean;
  error: string | null;
  progress: number | null;
  contentType: string | null;
  download: () => void;
};

export function useStreamedFileBlob(
  url: string | null,
  opts?: UseStreamedFileBlobOpts
): UseStreamedFileBlobResult {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [blob, setBlob] = React.useState<Blob | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [contentType, setContentType] = React.useState<string | null>(null);

  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!url) return;

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setBlobUrl(null);
    setBlob(undefined);

    (async () => {
      try {
        const res = await fetch(new URL(url, window.location.origin).toString(), {
          method: 'GET',
          signal: ac.signal,
          credentials: opts?.credentials ?? 'include',
          headers: {
            'X-API-KEY': opts?.apiKey ?? (process.env.NEXT_PUBLIC_PYTHON_API_KEY || ''),
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }

        const lenHeader = res.headers.get('content-length');
        const total = lenHeader ? Number(lenHeader) : undefined;
        const type = res.headers.get('content-type') || 'application/octet-stream';
        setContentType(type);

        const reader = res.body!.getReader();
        const parts: BlobPart[] = [];
        let received = 0;

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;

          const copy = new Uint8Array(value!.byteLength);
          copy.set(value!);
          parts.push(copy.buffer);

          received += value!.byteLength;
          if (total) {
            const pct = Math.max(0, Math.min(100, Math.round((received / total) * 100)));
            setProgress(pct);
            opts?.onProgress?.(received, total);
          } else {
            setProgress(null);
            opts?.onProgress?.(received, undefined);
          }
        }

        const blob = new Blob(parts, { type });
        setBlob(blob);

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const blobURL = URL.createObjectURL(blob);
        objectUrlRef.current = blobURL;
        setBlobUrl(blobURL);

        if (total) setProgress(100);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Stream error');
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      ac.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [url, opts?.apiKey, opts?.credentials]);

  const download = React.useCallback(() => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = url?.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [blobUrl, url]);

  return { blobUrl, blob, isLoading, error, progress, contentType, download };
}
