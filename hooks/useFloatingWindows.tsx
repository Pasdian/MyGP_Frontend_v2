import * as React from 'react';

export type WindowData = {
  id: number;
  title: string;
  ownedUrl: string; // window-owned blob URL
  contentType: string;
  textContent?: string;
  minimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function useFloatingWindows() {
  const [windows, setWindows] = React.useState<WindowData[]>([]);
  const nextIdRef = React.useRef<number>(1);

  React.useEffect(() => {
    // Revoke any remaining object URLs on unmount
    return () => {
      for (const w of windows) {
        if (w.ownedUrl?.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(w.ownedUrl);
          } catch {}
        }
      }
    };
    // We intentionally do NOT include `windows` as a dep to avoid revoking while active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spawnWindow = async (
    filename: string,
    sourceBlobUrl: string,
    contentType: string,
    initialGeom?: Partial<Pick<WindowData, 'x' | 'y' | 'width' | 'height'>>
  ) => {
    // If the passed URL is already a blob URL, you could skip re-fetch and clone via Response/Blob.
    let blob: Blob;
    try {
      const res = await fetch(sourceBlobUrl);
      blob = await res.blob();
    } catch (e) {
      // Fallback empty blob to avoid crashing
      blob = new Blob([`⚠️ No se pudo cargar: ${filename}`], { type: 'text/plain' });
    }
    const ownedUrl = URL.createObjectURL(blob);

    let textContent = '';
    if (!contentType.includes('pdf')) {
      try {
        // This may still produce gibberish for binary, but won't crash
        textContent = await fetch(ownedUrl).then((r) => r.text());
      } catch {
        textContent = '⚠️ No se pudo mostrar el contenido como texto.';
      }
    }

    const defaultWidth = initialGeom?.width ?? 760;
    const defaultHeight = initialGeom?.height ?? 800;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const x = initialGeom?.x ?? Math.max(24, (vw - defaultWidth) / 2);
    const y = initialGeom?.y ?? Math.max(24, (vh - defaultHeight) / 2);

    const id = nextIdRef.current++;

    setWindows((prev) => [
      ...prev,
      {
        id,
        title: filename,
        ownedUrl,
        contentType,
        textContent,
        minimized: false,
        x,
        y,
        width: defaultWidth,
        height: defaultHeight,
      },
    ]);
  };

  const closeWindow = (id: number) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (win?.ownedUrl?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(win.ownedUrl);
        } catch {}
      }
      return prev.filter((w) => w.id !== id);
    });
  };

  const toggleMinimize = (id: number) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));

  const updateGeometry = (id: number, x: number, y: number, width: number, height: number) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y, width, height } : w)));

  const bringToFront = (id: number) =>
    setWindows((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx === -1) return prev;
      const copy = [...prev];
      const [win] = copy.splice(idx, 1);
      copy.push(win);
      return copy;
    });

  return { windows, spawnWindow, closeWindow, toggleMinimize, updateGeometry, bringToFront };
}
