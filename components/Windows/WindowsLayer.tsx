'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

// Portal to render DEA Windows at the top of the DOM tree
export default function WindowsLayer({ children }: { children: React.ReactNode }) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  // create host div once
  if (typeof document !== 'undefined' && !hostRef.current) {
    const el = document.createElement('div');
    el.id = 'windows-layer';
    // full-viewport, above everything
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      pointerEvents: 'none', // windows inside will re-enable
    });
    hostRef.current = el;
  }

  React.useEffect(() => {
    const host = hostRef.current!;
    document.body.appendChild(host);
    return () => {
      if (host.parentNode) host.parentNode.removeChild(host);
    };
  }, []);

  if (!hostRef.current) return null;
  return createPortal(children, hostRef.current);
}
