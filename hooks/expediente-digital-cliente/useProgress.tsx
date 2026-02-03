import { GPClient } from '@/lib/axiosUtils/axios-instance';
import * as React from 'react';
import { toast } from 'sonner';

type UseProgressOptions = {
  path?: string; // relative path that your backend expects
  mapKey: string;
  requiredFiles?: number;
  setProgressMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  showToastOnError?: boolean;
};

type ProgressResponse = {
  progress?: number;
  scannedFiles?: number;
  requiredFiles?: number;
  path?: string;
};

export function useProgress({
  path,
  mapKey,
  requiredFiles = 2,
  setProgressMap,
  showToastOnError = false,
}: UseProgressOptions) {
  const [isFetching, setIsFetching] = React.useState(false);

  const fetchProgress = React.useCallback(async () => {
    const p = (path ?? '').trim();
    if (!p) return;

    const controller = new AbortController();

    try {
      setIsFetching(true);

      const resp = await GPClient.get<ProgressResponse>('/expediente-digital-cliente/getProgress', {
        params: {
          // match your FastAPI signature:
          required_files: requiredFiles,
          path: p,
        },
        signal: controller.signal,
      });

      const value = resp.data?.progress;
      if (value == null || Number.isNaN(Number(value))) return;

      setProgressMap((prev) => ({
        ...prev,
        [mapKey]: Number(value),
      }));
    } catch (err: any) {
      // ignore aborted requests
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;

      console.error(err);
      if (showToastOnError) {
        toast.error(err?.message ?? 'Error al obtener progreso');
      }
    } finally {
      setIsFetching(false);
    }

    return () => controller.abort();
  }, [path, mapKey, requiredFiles, setProgressMap, showToastOnError]);

  React.useEffect(() => {
    let cleanup: void | (() => void);

    (async () => {
      cleanup = await fetchProgress();
    })();

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchProgress]);

  return {
    isFetching,
    refetch: fetchProgress,
  };
}
