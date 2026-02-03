// useClientLogo.ts
import * as React from 'react';

export function useClientLogo(client: string | null, version = 0) {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // keep a ref to revoke the previous ObjectURL
  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!client) {
      setLogoUrl(null);
      return;
    }

    const controller = new AbortController();
    const url =
      `/dea/getFileContent` +
      `?source=${encodeURIComponent(`/GESTION/${client}/logo.png`)}` +
      `&v=${version}` + // cache buster
      `&api_key=${process.env.NEXT_PUBLIC_PYTHON_API_KEY}`;

    setIsLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal, cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          // 404 or other status: treat as no logo
          setLogoUrl(null);
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Not an image');
        const objUrl = URL.createObjectURL(blob);
        // revoke previous url before replacing
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objUrl;
        setLogoUrl(objUrl);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
      // do not revoke here; we revoke right before replacing to avoid flicker
    };
  }, [client, version]);

  return { logoUrl, isLoading, error };
}
