'use client';

import { runHardResetIfNeeded } from '@/lib/runHardReset';
import { useEffect } from 'react';

export function VersionGate() {
  useEffect(() => {
    runHardResetIfNeeded();
  }, []);

  return null;
}
