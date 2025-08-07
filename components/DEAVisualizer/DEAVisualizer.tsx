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
  return (
    <div>
      {isLoading && (
        <div className={`w-full h-[${visualizerSize}px] flex justify-center items-center`}>
          <TailwindSpinner />
        </div>
      )}
      {content && !isLoading && (
        <div className={`w-full h-[${visualizerSize}px] overflow-y-auto`}>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f6f8fa',
              padding: '1rem',
              wordBreak: 'break-word',
            }}
          >
            {content}
          </pre>
        </div>
      )}

      {pdfUrl && !isLoading && (
        <div className={`w-full h-[${visualizerSize}px]`}>
          <iframe
            src={pdfUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}
