import * as React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShowFileProps = {
  path?: string;
};

export function ShowFile({ path }: ShowFileProps) {
  const spawnWindow = React.useCallback(async () => {
    if (!path) return;

    // Open FIRST to avoid popup blockers
    const popup = window.open(
      'about:blank',
      '_blank',
      [
        'noopener=yes',
        'noreferrer=yes',
        'popup=yes',
        'resizable=yes',
        'scrollbars=yes',
        'width=1100',
        'height=800',
      ].join(',')
    );

    if (!popup) {
      console.warn('Popup blocked. Please allow popups for this site.');
      return;
    }

    try {
      const url = `/expediente-digital-cliente/getFile?path=${encodeURIComponent(
        path
      )}&api_key=91940ba1-ec71-4d4d-bd14-bbde49ce50cc`;

      // If your API uses cookies/session, keep credentials
      const res = await fetch(url, { credentials: 'include' });

      if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      popup.location.href = blobUrl;

      // Clean up when the popup closes
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          URL.revokeObjectURL(blobUrl);
        }
      }, 500);
    } catch (e) {
      console.error(e);
      popup.document.write('<p style="font-family:sans-serif">Error loading PDF.</p>');
      popup.document.close();
    }
  }, [path]);

  return (
    <Button
      type="button"
      onClick={spawnWindow}
      disabled={!path}
      className="bg-blue-500 hover:bg-blue-600 h-8 w-8 p-0 flex items-center justify-center"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
