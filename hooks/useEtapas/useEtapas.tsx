import { EtapasContext } from '@/contexts/EtapasContext';
import React from 'react';

export function useEtapas() {
  const context = React.useContext(EtapasContext);
  if (!context) {
    throw new Error('useEtapas must be used within an EtapasProvider');
  }
  return context;
}
