import { Maximize2Icon, Minus, X } from 'lucide-react';
import { Rnd } from 'react-rnd';
import DEAFileVisualizer from '../DEAVisualizer/DEAVisualizer';
import { DEAWindowData as WindowData } from '@/types/dea/deaFileVisualizerData';

export default function DEADraggableWindow({
  window,
  setWindows,
}: {
  window: WindowData;
  setWindows: React.Dispatch<React.SetStateAction<WindowData[]>>;
}) {
  const updateWindowPosition = (id: number, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, prev: { ...win }, x, y } : win))
    );
  };

  const updateWindowSize = (id: number, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, prev: { ...win }, width, height } : win))
    );
  };

  const updateWindowsVisibility = (id: number) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, prev: { ...win }, visible: false } : win))
    );
  };

  const updateWindowsCollapse = (id: number, collapse: boolean) => {
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id
          ? {
              ...win,
              prevData: { ...win }, // save current state
              collapse,
              width: win.width,
              height: 1,
            }
          : win
      )
    );
  };

  const restoreWindowSize = (id: number) => {
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id === id && win.prevData) {
          console.log('Restoring window:', win.id, win.prevData);
          return {
            ...win,
            width: win.prevData.width,
            height: win.prevData.height,
            collapse: win.prevData.collapse ?? false,
            prevData: null,
          };
        }
        return win;
      })
    );
  };

  if (!window.visible) return;

  return (
    <Rnd
      key={window.id}
      default={{
        x: window.x,
        y: window.y,
        width: window.width,
        height: window.height,
      }}
      position={{ x: window.x, y: window.y }}
      size={{ width: window.width, height: window.height }}
      onDragStop={(_, d) => updateWindowPosition(window.id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(window.id, ref.offsetWidth, ref.offsetHeight);
        updateWindowPosition(window.id, position.x, position.y);
      }}
      style={{
        border: '2px solid black',
        position: 'fixed',
        background: '#fff',
        zIndex: 1000 + window.id,
      }}
    >
      <div className="flex justify-between items-center px-4 py-2 bg-purple-500">
        <h2 className="text-sm text-white font-bold">{window.title}</h2>
        <div className="flex">
          {!window.collapse ? (
            <Minus
              className="text-white hover:bg-gray-400 cursor-pointer"
              onClick={() => updateWindowsCollapse(window.id, true)}
            />
          ) : (
            <Maximize2Icon
              className="w-8 text-white hover:bg-gray-400 cursor-pointer"
              onClick={() => restoreWindowSize(window.id)}
            />
          )}
          <X
            className="w-8 text-white hover:bg-red-500 cursor-pointer"
            onClick={() => updateWindowsVisibility(window.id)}
          />
        </div>
      </div>
      <div className="p-4 text-xs">
        {!window.collapse && (
          <DEAFileVisualizer
            content={window.content}
            isLoading={window.isLoading}
            pdfUrl={window.pdfUrl}
          />
        )}
      </div>
    </Rnd>
  );
}
