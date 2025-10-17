import { driver } from 'driver.js';
import React from 'react';

// Reusable helper: build the tour for the External Link icon
export function buildDEAExternalLinkTour() {
  return driver({
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
          title: 'Abrir en ventana flotante',
          description:
            'Haz clic aquí para abrir el archivo seleccionado en una ventana flotante e independiente. Puedes moverla, redimensionarla y mantener varias abiertas.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  });
}

export default function useDEATourOnce({
  enabled,
  userId,
  storageKey = 'dea-external-link-tour-v1',
}: {
  enabled: boolean;
  userId?: string | number;
  storageKey?: string;
}) {
  React.useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const KEY = `${storageKey}:${userId ?? 'anon'}`;
    if (localStorage.getItem(KEY)) return; // already shown

    const el = document.querySelector('#dea-external-link');
    if (!el) return; // wait until the icon exists

    const d = buildDEAExternalLinkTour();

    // Mark as seen as soon as we start (simplest & robust)
    localStorage.setItem(KEY, '1');

    d.drive();
  }, [enabled, userId, storageKey]);
}
