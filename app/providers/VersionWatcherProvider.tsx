'use client';

import { useEffect } from 'react';

const CLIENT_RELEASE_VERSION = process.env.NEXT_PUBLIC_RELEASE_VERSION;

// 1 hour in ms
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 3_600_000

export function VersionWatcherProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    if (!CLIENT_RELEASE_VERSION) return;

    let intervalId: number | undefined;

    const checkVersion = async () => {
      try {
        const res = await fetch('/frontend-version', { cache: 'no-store' });
        if (!res.ok) return;

        const data = (await res.json()) as { version?: string };
        const serverVersion = data.version;

        // Refresh on ANY version mismatch
        if (serverVersion && serverVersion !== CLIENT_RELEASE_VERSION) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error checking version', error);
      }
    };

    // Initial check
    checkVersion();

    // Periodic check (every hour)
    intervalId = window.setInterval(checkVersion, CHECK_INTERVAL_MS);

    // Re-check on tab visibility change (so users don't wait up to 1h)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return <>{children}</>;
}
