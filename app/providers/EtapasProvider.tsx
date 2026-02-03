'use client';

import { useEtapasData } from '@/hooks/useEtapas/useEtapasData';
import { EtapasContext } from '@/contexts/EtapasContext';

export default function EtapasProvider({
  children,
  NUM_REFE,
}: {
  children: React.ReactNode;
  NUM_REFE: string;
}) {
  const value = useEtapasData(NUM_REFE);

  return <EtapasContext.Provider value={value}>{children}</EtapasContext.Provider>;
}
