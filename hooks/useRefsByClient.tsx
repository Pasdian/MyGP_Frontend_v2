import { useDEAStore } from '@/app/providers/dea-store-provider';
import React from 'react';

type RefRecord = {
  NUM_REFE: string;
  ADU_DESP: string;
  FOLDER_HAS_CONTENT: boolean;
};

// Helper: format a Date as local YYYY-MM-DD (avoids UTC shift from toISOString)
function toYMDLocal(d?: Date) {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useRefsByClient(
  client: string | null,
  initialDate: Date | undefined,
  finalDate: Date | undefined
) {
  const [refs, setRefs] = React.useState<RefRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Memoize primitive dependencies to keep the effect stable
  const initialStr = React.useMemo(() => toYMDLocal(initialDate), [initialDate]);
  const finalStr = React.useMemo(() => toYMDLocal(finalDate), [finalDate]);

  React.useEffect(() => {
    if (!client) return;

    setIsLoading(true);
    setError(null);
    setRefs([]);

    const url = new URL(`/dea/getRefsByClient/events`, window.location.origin);
    url.searchParams.set('initialDate', initialStr);
    url.searchParams.set('finalDate', finalStr);
    url.searchParams.set('client', client);
    url.searchParams.set('api_key', process.env.NEXT_PUBLIC_PYTHON_API_KEY || '');

    const es = new EventSource(url.toString(), { withCredentials: true });

    const onRef = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as RefRecord;
        setRefs((prev) => [...prev, data]);
      } catch (e) {
        console.warn('Bad SSE data', e);
      }
    };

    const onDone = () => {
      setIsLoading(false);
      es.close();
    };

    const onError = (err: any) => {
      console.error('SSE error:', err);
      setError('Connection lost or stream error');
      setIsLoading(false);
      es.close();
    };

    es.addEventListener('ref', onRef as any);
    es.addEventListener('done', onDone as any);
    es.addEventListener('error', onError as any);

    return () => {
      es.removeEventListener('ref', onRef as any);
      es.removeEventListener('done', onDone as any);
      es.removeEventListener('error', onError as any);
      es.close();
    };
    // Re-run whenever client OR either date changes
  }, [client, initialStr, finalStr]);

  return { refs, isLoading, error };
}
