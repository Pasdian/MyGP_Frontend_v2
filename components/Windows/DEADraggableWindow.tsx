'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { Minus, X, Minimize2Icon, SquareIcon } from 'lucide-react';
import DEAFileVisualizer from '../DEAVisualizer/DEAVisualizer';
import { DEAWindowData as WindowData } from '@/types/dea/deaFileVisualizerData';
import { useWindowManager } from '@/app/providers/WIndowManagerProvider';

const HEADER_HEIGHT = 32;

export default function DEADraggableWindow({
  draggableWindow,
  setWindows,
}: {
  draggableWindow: WindowData;
  setWindows: React.Dispatch<React.SetStateAction<WindowData[]>>;
}) {
  const { activeWindowId, setActiveWindowId } = useWindowManager();
  const [interacting, setInteracting] = React.useState(false);
  const [maximized, setMaximized] = React.useState(false);
  const prevState = React.useRef<{ x: number; y: number; width: number; height: number } | null>(
    null
  );

  React.useEffect(() => {
    if (!draggableWindow.visible && activeWindowId === draggableWindow.id) {
      setActiveWindowId(null);
    }
  }, [draggableWindow.visible, activeWindowId, draggableWindow.id, setActiveWindowId]);

  if (!draggableWindow.visible) return null;

  const makeActive = () => setActiveWindowId(draggableWindow.id);

  const updateWindowPosition = (id: number, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, x, y, prev: { ...win } } : win))
    );
  };

  const updateWindowSize = (id: number, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, width, height, prev: { ...win } } : win))
    );
  };

  const closeWindow = (id: number) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: number) => {
    setWindows((prev) => prev.map((win) => (win.id === id ? { ...win, visible: false } : win)));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const maximizeWindow = (id: number) => {
    if (!maximized) {
      // save old position/size
      prevState.current = {
        x: draggableWindow.x,
        y: draggableWindow.y,
        width: draggableWindow.width,
        height: draggableWindow.height,
      };
      // expand to full window
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id
            ? { ...win, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
            : win
        )
      );
      setMaximized(true);
    } else {
      // restore
      if (prevState.current) {
        setWindows((prev) =>
          prev.map((win) =>
            win.id === id
              ? {
                  ...win,
                  ...prevState.current,
                }
              : win
          )
        );
      }
      setMaximized(false);
    }
    setActiveWindowId(id);
  };

  return (
    <div
      onMouseDown={makeActive}
      onFocus={makeActive}
      tabIndex={-1}
      style={{ pointerEvents: 'auto' }}
    >
      <Rnd
        className="dea-rnd"
        bounds="window"
        position={{ x: draggableWindow.x, y: draggableWindow.y }}
        size={{ width: draggableWindow.width, height: draggableWindow.height }}
        minWidth={720}
        minHeight={520}
        enableResizing={!maximized}
        disableDragging={maximized}
        dragHandleClassName="dea-window-title"
        cancel=".dea-window-controls,.dea-window-btn"
        resizeHandleStyles={{
          bottomRight: {
            width: '28px',
            height: '28px',
            right: '-14px',
            bottom: '-14px',
            zIndex: 9999,
            cursor: 'nwse-resize',
            background: 'transparent', // clickable but invisible
          },
          bottomLeft: {
            width: '28px',
            height: '28px',
            left: '-14px',
            bottom: '-14px',
            zIndex: 9999,
            cursor: 'nesw-resize',
            background: 'transparent',
          },
          topRight: {
            width: '28px',
            height: '28px',
            right: '-14px',
            top: '-14px',
            zIndex: 9999,
            cursor: 'nesw-resize',
            background: 'transparent',
          },
          topLeft: {
            width: '28px',
            height: '28px',
            left: '-14px',
            top: '-14px',
            zIndex: 9999,
            cursor: 'nwse-resize',
            background: 'transparent',
          },
          right: {
            width: '16px',
            right: '-8px',
            top: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'ew-resize',
            background: 'transparent',
          },
          left: {
            width: '16px',
            left: '-8px',
            top: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: 'ew-resize',
            background: 'transparent',
          },
          bottom: {
            height: '16px',
            bottom: '-8px',
            left: 0,
            right: 0,
            zIndex: 9999,
            cursor: 'ns-resize',
            background: 'transparent',
          },
          top: {
            height: '16px',
            top: '-8px',
            left: 0,
            right: 0,
            zIndex: 9999,
            cursor: 'ns-resize',
            background: 'transparent',
          },
        }}
        onDragStart={() => {
          setInteracting(true);
          setActiveWindowId(draggableWindow.id);
        }}
        onDragStop={(_, d) => {
          setInteracting(false);
          updateWindowPosition(draggableWindow.id, d.x, d.y);
          setActiveWindowId(draggableWindow.id);
        }}
        onResizeStart={() => {
          setInteracting(true);
          setActiveWindowId(draggableWindow.id);
        }}
        onResizeStop={(_, __, ref, ___, position) => {
          setInteracting(false);
          updateWindowSize(draggableWindow.id, ref.offsetWidth, ref.offsetHeight);
          updateWindowPosition(draggableWindow.id, position.x, position.y);
          setActiveWindowId(draggableWindow.id);
        }}
        style={{
          border: '3px solid black',
          position: 'fixed',
          background: '#fff',
          zIndex: 1000 + draggableWindow.id,
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
      >
        <div className="dea-window-title flex justify-between items-center px-4 py-1 bg-purple-500">
          <h2 className="text-xs text-white font-bold">{draggableWindow.title}</h2>
          <div className="dea-window-controls flex">
            <button
              type="button"
              className="dea-window-btn px-1 text-white hover:bg-gray-400 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                minimizeWindow(draggableWindow.id);
              }}
              aria-label="Minimize"
              title="Minimizar"
            >
              <Minus size={14} />
            </button>

            <button
              type="button"
              className="dea-window-btn px-1 text-white hover:bg-gray-400 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(draggableWindow.id);
              }}
              aria-label="Maximize"
              title="Maximizar"
            >
              {maximized ? <Minimize2Icon size={14} /> : <SquareIcon size={12} />}
            </button>

            <button
              type="button"
              className="dea-window-btn px-1 text-white hover:bg-red-500 cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                closeWindow(draggableWindow.id);
              }}
              aria-label="Close"
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div
          className="text-xs relative"
          style={{ height: `calc(100% - ${HEADER_HEIGHT}px)`, zIndex: 99 }}
        >
          <DEAFileVisualizer
            content={draggableWindow.content}
            contentOverride={draggableWindow.content}
            pdfSrcOverride={draggableWindow.pdfUrl}
            isLoading={draggableWindow.isLoading}
            windowId={draggableWindow.id}
            interacting={interacting}
          />
        </div>
      </Rnd>
    </div>
  );
}
