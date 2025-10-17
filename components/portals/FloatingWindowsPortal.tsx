import { WindowData } from '@/hooks/useFloatingWindows';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';

export function FloatingWindowsPortal({
  windows,
  closeWindow,
  toggleMinimize,
  updateGeometry,
  bringToFront,
}: {
  windows: WindowData[];
  closeWindow: (id: number) => void;
  toggleMinimize: (id: number) => void;
  updateGeometry: (id: number, x: number, y: number, w: number, h: number) => void;
  bringToFront: (id: number) => void;
}) {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    // Only run in browser
    if (typeof document === 'undefined') return;

    let el = document.getElementById('floating-windows-root') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'floating-windows-root';
      Object.assign(el.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '2147483647',
        pointerEvents: 'none', // let the container be transparent...
      } as Partial<CSSStyleDeclaration>);
      document.body.appendChild(el);
    }
    setRoot(el);
  }, []);

  if (!root) return null;

  const visible = windows.filter((w) => !w.minimized);
  const minimized = windows.filter((w) => w.minimized);

  return createPortal(
    <>
      {visible.map((win, idx) => (
        <Rnd
          key={win.id}
          bounds="window"
          size={{ width: win.width, height: win.height }}
          position={{ x: win.x, y: win.y }}
          dragHandleClassName={`win-${win.id}-titlebar`}
          cancel=".win-content"
          onDragStart={() => bringToFront(win.id)}
          onDragStop={(_, d) => updateGeometry(win.id, d.x, d.y, win.width, win.height)}
          onResizeStart={() => bringToFront(win.id)}
          onResizeStop={(_, __, ref, ___, pos) =>
            updateGeometry(win.id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
          }
          // Give each window its own stacking context & allow interactions
          style={{ zIndex: 1000 + idx, pointerEvents: 'auto' }}
          className="shadow-xl bg-white rounded-md border border-gray-300 flex flex-col"
        >
          <div
            onMouseDown={() => bringToFront(win.id)}
            className={`win-${win.id}-titlebar flex justify-between items-center px-3 py-2 bg-blue-600 text-white rounded-t-md select-none cursor-move`}
          >
            <span className="font-semibold truncate">{win.title}</span>
            <div className="flex gap-3">
              <button onClick={() => toggleMinimize(win.id)} aria-label="Minimize">
                –
              </button>
              <button onClick={() => closeWindow(win.id)} aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          <div className="win-content w-full h-full flex-1 min-h-0 overflow-hidden">
            {win.contentType.includes('pdf') ? (
              <iframe src={win.ownedUrl} className="w-full h-full block" />
            ) : (
              <pre className="p-4 bg-gray-50 rounded-b-md w-full h-full text-sm whitespace-pre-wrap break-words overflow-auto">
                {win.textContent}
              </pre>
            )}
          </div>
        </Rnd>
      ))}

      {minimized.length > 0 && (
        <div
          // toolbar receives events
          style={{ pointerEvents: 'auto' }}
          className="fixed bottom-2 left-1/2 -translate-x-1/2 flex gap-2"
        >
          {minimized.map((w) => (
            <button
              key={w.id}
              onClick={() => toggleMinimize(w.id)}
              className="bg-blue-600 text-white rounded-md px-3 py-1 shadow hover:bg-blue-700 text-sm"
              title="Restaurar"
            >
              {w.title}
            </button>
          ))}
        </div>
      )}
    </>,
    root
  );
}
