'use client';

import { reloadIfNeeded } from '@/lib/reloadIfNeeded';
import { useEffect } from 'react';

export function VersionGate() {
  useEffect(() => {
    reloadIfNeeded();
  }, []);

  return null;
}
