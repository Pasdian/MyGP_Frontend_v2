import * as React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

export type DocMapping = {
  filename: string;
  sizeLimit: number;
  relativePath: string;
};

type DocMappingsResponse = {
  count: number;
  mappings: Record<string, DocMapping>;
};

let cache: Record<string, DocMapping> | null = null;

export function useDocMappings() {
  const [mappings, setMappings] = React.useState<Record<string, DocMapping> | null>(cache);
  const [isLoading, setIsLoading] = React.useState(!cache);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    if (cache) return;

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await GPClient.get<DocMappingsResponse>(
          '/expediente-digital-cliente/docMappings'
        );
        cache = res.data.mappings ?? {};
        if (mounted) setMappings(cache);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { mappings, isLoading, error };
}
