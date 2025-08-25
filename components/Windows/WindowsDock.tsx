'use client';

import React from 'react';
import { useWindowManager } from '@/app/providers/WIndowManagerProvider';
import { DEAWindowData as WindowData } from '@/types/dea/deaFileVisualizerData';

export default function WindowsDock({
  windows,
  setWindows,
}: {
  windows: WindowData[];
  setWindows: React.Dispatch<React.SetStateAction<WindowData[]>>;
}) {
  const { setActiveWindowId } = useWindowManager();

  // Dock lists minimized windows: visible === false
  const minimized = windows.filter((w) => !w.visible);

  if (!minimized.length) return null;

  const restore = (id: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, visible: true } : w)));
    setActiveWindowId(id);
  };

  return (
    <div className="fixed bottom-3 right-3 flex flex-wrap gap-2 z-[1]">
      {minimized.map((w) => (
        <button
          key={w.id}
          type="button"
          className="dea-dock-btn px-2 py-1 rounded bg-purple-600 text-white text-xs shadow hover:bg-purple-700 max-w-[220px] truncate"
          onClick={() => restore(w.id)}
          title={`Restaurar: ${w.title || `Ventana ${w.id}`}`}
        >
          {w.title || `Ventana ${w.id}`}
        </button>
      ))}
    </div>
  );
}
