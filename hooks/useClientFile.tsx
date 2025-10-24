import * as React from 'react';

type UseClientFileResult = {
  fileUrl: string | null;
  contentType: string | null;
  isLoading: boolean;
  error: string | null;
  download: () => void;
};

export function useClientFile(
  client: string | null,
  reference: string | null,
  subfolder: string | null,
  filename: string | null
): UseClientFileResult {
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const [contentType, setContentType] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Only run when all params are defined
    if (!client || !reference || !subfolder || !filename) {
      setFileUrl(null);
      setContentType(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const fetchUrl = `/dea/getFileContent?source=/GESTION/${client}/${reference}/${subfolder}/${filename}&api_key=${process.env.NEXT_PUBLIC_PYTHON_API_KEY}`;

    setIsLoading(true);
    setError(null);

    fetch(fetchUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const type = res.headers.get('content-type') || 'application/octet-stream';
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);

        setContentType(type);
        setFileUrl(objectUrl);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setIsLoading(false));

    return () => {
      controller.abort();
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [client, reference, subfolder, filename]); // ✅ refetches automatically when any changes

  const download = React.useCallback(() => {
    if (!fileUrl || !filename) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = filename;
    a.click();
  }, [fileUrl, filename]);

  return { fileUrl, contentType, isLoading, error, download };
}
