'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 300000, // 5 minutes in milliseconds
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
