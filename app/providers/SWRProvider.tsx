import { SWRConfig } from 'swr';
import React from 'react';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false, // don’t refetch on tab focus
        revalidateOnReconnect: false, // don’t refetch when network reconnects
        refreshInterval: 0, // no polling
      }}
    >
      {children}
    </SWRConfig>
  );
}
