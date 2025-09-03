'use client';

import { useWindowManager } from '@/app/providers/WIndowManagerProvider';
import TailwindSpinner from '../ui/TailwindSpinner';

export default function DEAFileVisualizer({
  content,
  isLoading,
  pdfUrl,
  windowId,
  interacting = false,
}: {
  content: string;
  isLoading: boolean;
  pdfUrl?: string; // ✅ new prop
  windowId?: number;
  interacting?: boolean;
}) {
  const { activeWindowId } = useWindowManager();

  const text = content;
  const hasText = !!text && !isLoading;
  const hasPdf = !!pdfUrl && !isLoading;

  const allowPointerEvents =
    windowId != null ? activeWindowId === windowId && !interacting : activeWindowId == null;

  return (
    <div className="h-full min-h-0 flex flex-col">
      {isLoading && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <TailwindSpinner />
        </div>
      )}

      {hasText && (
        <div className="flex-1 min-h-0 w-full overflow-auto">
          <pre
            className="p-4 m-0"
            style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', wordBreak: 'break-word' }}
          >
            {text}
          </pre>
        </div>
      )}

      {hasPdf && (
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

      {!isLoading && !hasText && !hasPdf && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center text-sm text-muted-foreground">
          Sin archivo seleccionado.
        </div>
      )}
    </div>
  );
}
