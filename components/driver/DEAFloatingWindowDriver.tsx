import { WindowData } from '@/hooks/useFloatingWindows';
import { driver } from 'driver.js';
import { ExternalLink } from 'lucide-react';
import React from 'react';

export default function DEAFloatingWindowDriver({
  fileUrl,
  contentType,
  filename,
  spawnWindow,
}: {
  fileUrl: string;
  contentType: string | null;
  filename: string;
  spawnWindow: (
    filename: string,
    sourceBlobUrl: string,
    contentType: string,
    initialGeom?: Partial<Pick<WindowData, 'height' | 'width' | 'x' | 'y'>> | undefined
  ) => Promise<void>;
}) {
  React.useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('deaExternalLinkTourSeen');

    if (!hasSeenTour) {
      const tour = driver({
        allowClose: true,
        showProgress: false,
        popoverClass: 'text-xs',
        showButtons: ['next', 'close'],
        nextBtnText: 'Siguiente',
        doneBtnText: 'Cerrar',

        steps: [
          {
            element: '#dea-external-link',
            popover: {
              title: 'Ventana flotante',
              description:
                'Da click en el icono para abrir una ventana flotante del documento actual.',
              side: 'left',
              align: 'start',
            },
          },
        ],
      });
      tour.drive();

      // Mark as seen
      localStorage.setItem('deaExternalLinkTourSeen', 'true');
    }
  }, []);

  return (
    <button
      id="dea-external-link"
      type="button"
      aria-label="Abrir en ventana separada"
      className="grid place-items-center rounded hover:bg-blue-600/50 active:scale-95 transition px-1"
      onClick={() => {
        if (fileUrl && contentType) spawnWindow(filename, fileUrl, contentType);
      }}
    >
      <ExternalLink size={16} className="cursor-pointer" />
    </button>
  );
}
