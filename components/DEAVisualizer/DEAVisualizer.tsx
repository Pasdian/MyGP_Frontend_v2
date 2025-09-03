'use client';

import { useWindowManager } from '@/app/providers/WIndowManagerProvider';
import TailwindSpinner from '../ui/TailwindSpinner';
import React from 'react';

export default function DEAFileVisualizer({
  content,
  isLoading,
  pdfUrl,
  windowId,
  interacting = false,
}: {
  content: string;
  isLoading: boolean;
  pdfUrl?: string;
  windowId?: number;
  interacting?: boolean;
}) {
  const { activeWindowId } = useWindowManager();

  // Derive exactly one mode
  const text = content;
  const hasText = Boolean(text);
  const hasPdf = Boolean(pdfUrl);

  const mode: 'loading' | 'pdf' | 'text' | 'empty' = React.useMemo(() => {
    if (isLoading) return 'loading';
    if (hasPdf) return 'pdf';
    if (hasText) return 'text';
    return 'empty';
  }, [isLoading, hasPdf, hasText]);

  // Pointer lock: only the active floating window should interact; main viewer always can
  const allowPointerEvents = windowId == null ? true : activeWindowId === windowId && !interacting;

  return (
    <div className="h-full min-h-0 flex flex-col">
      {mode === 'loading' && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <TailwindSpinner />
        </div>
      )}

      {mode === 'text' && (
        <div className="flex-1 min-h-0 w-full overflow-auto">
          <pre
            className="p-4 m-0"
            style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', wordBreak: 'break-word' }}
            role="document"
          >
            {text}
          </pre>
        </div>
      )}

      {mode === 'pdf' && (
        <div className="flex-1 min-h-0 w-full relative">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="w-full h-full"
            style={{ border: 'none', pointerEvents: allowPointerEvents ? 'auto' : 'none' }}
            tabIndex={allowPointerEvents ? 0 : -1}
          />
        </div>
      )}

      {mode === 'empty' && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center text-sm text-muted-foreground">
          Sin archivo seleccionado.
        </div>
      )}
    </div>
  );
}
