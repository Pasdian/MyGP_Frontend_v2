import { driver } from 'driver.js';
import { ExternalLink } from 'lucide-react';
import React from 'react';

export default function DEAFloatingWindowDriver({
  filename,
  spawnWindow,
}: {
  filename: string;
  spawnWindow: () => void;
}) {
  React.useEffect(() => {
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
      localStorage.setItem('deaExternalLinkTourSeen', 'true');
    }
  }, []);

  return (
    <button
      id="dea-external-link"
      type="button"
      aria-label={`Abrir ${filename} en ventana separada`}
      className="grid place-items-center rounded hover:bg-blue-600/50 active:scale-95 transition px-1"
      onClick={spawnWindow}
    >
      <ExternalLink size={16} className="cursor-pointer" />
    </button>
  );
}
