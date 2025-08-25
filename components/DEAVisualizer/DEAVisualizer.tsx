'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import TailwindSpinner from '../ui/TailwindSpinner';
import { useWindowManager } from '@/app/providers/WIndowManagerProvider';

export default function DEAFileVisualizer({
  content,
  isLoading,
  windowId, // when inside a draggable window
  interacting = false, // window is being dragged/resized
  pdfSrcOverride, // prefer window's PDF
  contentOverride, // prefer window's text
}: {
  content: string; // fallback for the main viewer
  isLoading: boolean;
  windowId?: number;
  interacting?: boolean;
  pdfSrcOverride?: string;
  contentOverride?: string;
}) {
  const storePdfUrl = useDEAStore((s) => s.pdfUrl);
  const { activeWindowId } = useWindowManager();

  const pdfUrl = pdfSrcOverride ?? storePdfUrl;
  const text = contentOverride ?? content;

  const hasText = !!text && !isLoading;
  const hasPdf = !!pdfUrl && !isLoading;

  // main viewer: interactive when NO pop-out is active
  // window viewer: interactive only when this window is active and not interacting
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
