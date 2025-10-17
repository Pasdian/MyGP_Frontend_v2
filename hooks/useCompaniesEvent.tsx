'use client';

import * as React from 'react';

type Row = { CVE_IMP: string; NOM_IMP: string };

const DEFAULT_URL = '/api/companies/getAllCompanies';

export function useCompaniesEvent(enabled = true) {
  // ⬅️ prevents fetch when disabled
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // ...fetch logic here
        const data = await fetch('/api/companies').then((r) => r.json());
        if (!cancelled) setRows(data.rows ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
  React.useEffect(() => {
    setRows([]);
    const es = new EventSource(DEFAULT_URL);

    const onCompany = (ev: MessageEvent) => {
      try {
        const r = JSON.parse(ev.data) as Row;
        setRows((prev) => (prev.some((p) => p.CVE_IMP === r.CVE_IMP) ? prev : [...prev, r]));
      } catch (e) {
        console.warn('Bad SSE data (company)', e, ev.data);
      }
    };
    es.addEventListener('company', onCompany as EventListener);

    // Optional: close on done
    es.addEventListener('done', () => es.close());

    es.addEventListener('error', (e) => {
      console.error('SSE error', e);
      es.close();
    });

    return () => {
      es.removeEventListener('company', onCompany as EventListener);
      es.close();
    };
  }, [DEFAULT_URL]);

  return { rows } as const;
}
