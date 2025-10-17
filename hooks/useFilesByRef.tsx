import * as React from 'react';

type FolderFilesMap = Record<string, string[]>;

export default function useFilesByRef(
  reference: string | null,
  client: string | null,
  opts?: { token?: string }
) {
  const [refs, setRefs] = React.useState<FolderFilesMap>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const loadedOnceRef = React.useRef(false); // track first full snapshot

  React.useEffect(() => {
    if (!reference || !client) return;

    setIsLoading(true);
    setError(null);
    setRefs({});
    loadedOnceRef.current = false;

    const url = new URL('/dea/getFilesByReference/events', window.location.origin);
    url.searchParams.set('reference', reference);
    url.searchParams.set('client', client);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');
    if (opts?.token) url.searchParams.set('token', opts.token);

    const es = new EventSource(url.toString(), { withCredentials: true });

    es.addEventListener('folder', (e) => {
      try {
        const { folder, files } = JSON.parse((e as MessageEvent).data) as {
          folder: string;
          files: string[];
        };
        if (folder && Array.isArray(files)) {
          setRefs((prev) => ({
            ...prev,
            [folder]: Array.from(new Set(files)),
          }));
        }
      } catch (err) {
        console.warn('Invalid folder event data', err);
      }
    });

    // IMPORTANT: don't close on "done" — just mark loading=false after the first cycle
    es.addEventListener('done', () => {
      if (!loadedOnceRef.current) {
        setIsLoading(false);
        loadedOnceRef.current = true;
      }
      // keep the stream open for future cycles triggered by uploads
    });

    // Let EventSource auto-reconnect; don't close on error
    es.onerror = (err) => {
      console.error('SSE error:', err);
      setError('Connection issue; attempting to reconnect…');
      // es will keep trying; if the server closes intentionally, it will reconnect
    };

    return () => {
      es.close(); // only close when unmounting / reference or client changes
    };
  }, [reference, client, opts?.token]);

  return { refs, isLoading, error };
}
