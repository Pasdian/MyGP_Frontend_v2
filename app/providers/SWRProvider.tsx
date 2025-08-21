'use client';
import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false, // no refetch on tab focus
      }}
    >
      {children}
    </SWRConfig>
  );
}
