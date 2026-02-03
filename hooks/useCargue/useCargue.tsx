// hooks/useCargue/useCargue.ts
'use client';

import React from 'react';
import { CarguesContext } from '@/contexts/CarguesContext';

export function useCargue() {
  const context = React.useContext(CarguesContext);
  if (!context) throw new Error('useCargue must be used within a CargueProvider');
  return context;
}
