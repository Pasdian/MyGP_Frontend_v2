import TailwindSpinner from '../ui/TailwindSpinner';

const visualizerSize = 700;

export default function DEAFileVisualizer({
  pdfUrl,
  content,
  isLoading,
}: {
  pdfUrl: string;
  content: string;
  isLoading: boolean;
}) {
  const hasText = !!content && !isLoading;
  const hasPdf = !!pdfUrl && !isLoading;

  return (
    // Fill parent and allow inner scrolling panes
    <div className="h-full min-h-0 flex flex-col">
      {isLoading && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <TailwindSpinner />
        </div>
      )}

      {hasText && (
        <div className="flex-1 min-h-0 w-full overflow-auto">
          <pre
            className="p-4"
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f6f8fa',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {content}
          </pre>
        </div>
      )}

      {hasPdf && (
        <div className="flex-1 min-h-0 w-full">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
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
