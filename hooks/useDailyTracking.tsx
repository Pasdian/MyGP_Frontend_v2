import React from 'react';
import type { DailyTracking } from '@/types/dashboard/tracking/dailyTracking';

function toYMDLocal(d?: Date) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useDailyTracking(initialDate?: Date, finalDate?: Date) {
  const [records, setRecords] = React.useState<DailyTracking[]>([]);

  React.useEffect(() => {
    const from = toYMDLocal(initialDate);
    const to = toYMDLocal(finalDate);
    if (!from || !to) return;

    setRecords([]); // reset on new range
    const es = new EventSource(`/api/daily-tracking?initialDate=${from}&finalDate=${to}`, {
      withCredentials: true,
    });

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg?.meta?.stage === 'start') return;
        if (msg?.done) {
          es.close();
          return;
        }
        const row = msg.row ?? msg;
        setRecords((prev) => [...prev, row]);
      } catch {
        // ignore bad data
      }
    };

    es.onerror = () => {
      es.close(); // stop infinite reconnects
    };

    return () => {
      es.close();
    };
  }, [initialDate, finalDate]);

  return { records };
}
