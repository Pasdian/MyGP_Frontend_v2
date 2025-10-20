'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import { Card } from '@/components/ui/card';
import React from 'react';
import DocumentCard from '@/components/Cards/DocumentCard';
import { ExternalLink, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UploadSingleFile from '@/components/UploadSingleFile/UploadSingleFile';
import Image from 'next/image';
import { WindowManagerProvider } from '@/app/providers/WIndowManagerProvider';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import useDEATourOnce, { buildDEAExternalLinkTour } from '@/hooks/useDEATour';
import { useStreamedFileBlob } from '@/hooks/useStreamBlob';
import { FloatingWindowsPortal } from '@/components/portals/FloatingWindowsPortal';
import { useFloatingWindows } from '@/hooks/useFloatingWindows';
import useFilesByRef from '@/hooks/useFilesByRef';

export default function DEA() {
  const { user } = useAuth();
  const { clientNumber: client, reference } = useDEAStore((state) => state);
  const [subfolder, setSubfolder] = React.useState('');
  const [filename, setFilename] = React.useState('');

  // Get files by reference stream
  const { refs } = useFilesByRef(reference, client);

  const CTA = refs['01-CTA-GASTOS'] ?? [];
  const ExpAduanal = refs['02-EXPEDIENTE-ADUANAL'] ?? [];
  const Fiscales = refs['03-FISCALES'] ?? [];
  const VUCEM = refs['04-VUCEM'] ?? [];
  const ExpDigital = refs['05-EXP-DIGITAL'] ?? [];

  // Get cliet logo stream
  const logoKey = React.useMemo(() => {
    if (!client) return null;
    return `/dea/getFileContent?source=/GESTION/${client}/logo.png`;
  }, [client]);
  const { blobUrl: logoSrc, isLoading: isLogoSrcLoading } = useStreamedFileBlob(logoKey);

  // Get any blob stream (pdf, xml, etc)
  const filenameBlobKey = React.useMemo(() => {
    if (!client || !reference || !subfolder || !filename) return null;
    return `/dea/getFileContent?source=/GESTION/${client}/${reference}/${subfolder}/${filename}`;
  }, [client, reference, subfolder, filename]);

  // Visualizer effect and contents
  const { blobUrl, contentType } = useStreamedFileBlob(filenameBlobKey);
  const [textContent, setTextContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!blobUrl || !contentType) return;

    // PDF? Don't read as text.
    if (contentType.includes('pdf')) {
      setTextContent(null);
      return;
    }

    // Everything else → try to read as text
    (async () => {
      try {
        const res = await fetch(blobUrl);
        const text = await res.text();
        setTextContent(text);
      } catch (err) {
        console.error('Error reading text content:', err);
        setTextContent('⚠️ Error reading file contents');
      }
    })();
  }, [blobUrl, contentType]);

  // Windows hook
  const { windows, spawnWindow, closeWindow, toggleMinimize, updateGeometry, bringToFront } =
    useFloatingWindows();

  // Tour effect
  useDEATourOnce({
    enabled: Boolean(filename), // will become true after onFileSelect
    userId: user?.complete_user?.user?.uuid ?? 'anon',
    // storageKey is optional; defaults to 'dea-external-link-tour-v1'
  });

  React.useEffect(() => {
    if (!filename) return; // only after user has a file context
    if (typeof window === 'undefined') return;

    const TOUR_KEY = 'dea-external-link-tour-v1';
    if (localStorage.getItem(TOUR_KEY)) return; // already shown

    // Ensure the icon exists in DOM before starting tour
    const el = document.querySelector('#dea-external-link');
    if (!el) return;

    const d = buildDEAExternalLinkTour();
    d.drive();
    localStorage.setItem(TOUR_KEY, '1');
  }, [filename]);

  // Manual trigger handler (help icon)
  const startTour = React.useCallback(() => {
    const d = buildDEAExternalLinkTour();
    d.drive();
  }, []);

  return (
    <WindowManagerProvider>
      <AccessGuard allowedModules={['All Modules', 'DEA']} allowedRoles={['ADMIN', 'DEA']}>
        <div className="h-full min-h-0">
          {reference && client && (
            <div className="h-full min-h-0">
              <div className="flex h-full min-h-0 gap-4 overflow-hidden">
                {/* LEFT column */}
                <div className="flex flex-col min-h-0 gap-4 overflow-hidden basis-[168px] shrink-0">
                  {/* Cuenta de Gastos */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Cuenta de Gastos"
                      files={CTA}
                      folder="01-CTA-GASTOS"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('01-CTA-GASTOS');
                      }}
                      activeFile={filename}
                    />
                  </div>

                  {/* Expediente Aduanal */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Expediente Aduanal"
                      files={ExpAduanal}
                      folder="02-EXPEDIENTE-ADUANAL"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('02-EXPEDIENTE-ADUANAL');
                      }}
                      activeFile={filename}
                    />
                  </div>

                  {/* Comprobantes Fiscales */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Comprobantes Fiscales"
                      files={Fiscales}
                      folder="03-FISCALES"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('03-FISCALES');
                      }}
                      activeFile={filename}
                    />
                  </div>
                </div>

                {/* RIGHT column */}
                <div className="flex flex-col min-h-0 gap-4 overflow-hidden basis-[168px] shrink-0">
                  {/* COVES */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="COVES"
                      files={VUCEM}
                      folder="04-VUCEM"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('04-VUCEM');
                      }}
                      activeFile={filename}
                      filterFn={(item) => item.includes('COVE') || item.includes('PSIM')}
                    />
                  </div>

                  {/* EDocs */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="EDocs"
                      files={VUCEM}
                      folder="04-VUCEM"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('04-VUCEM');
                      }}
                      activeFile={filename}
                      filterFn={(item) => !item.includes('COVE') && !item.includes('PSIM')}
                    />
                  </div>

                  {/* Expediente Digital */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Expediente Digital"
                      files={ExpDigital}
                      folder="05-EXP-DIGITAL"
                      onFileSelect={(item) => {
                        setFilename(item);
                        setSubfolder('05-EXP-DIGITAL');
                      }}
                      activeFile={filename}
                    />
                  </div>
                </div>

                {/* VIEWER */}
                <Card className="flex-[5] min-h-0 p-0 overflow-hidden rounded-none">
                  <div className="h-full flex flex-col min-h-0 text-xs">
                    <div className="sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center z-10">
                      <p className="font-bold truncate">
                        Visor de Archivos{filename ? ` - ${filename}` : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        {/* Help trigger to replay the tour */}
                        {filename && (
                          <button
                            type="button"
                            aria-label="¿Cómo funciona?"
                            className="grid place-items-center rounded hover:bg-blue-600/50 active:scale-95 transition px-1"
                            onClick={startTour}
                          >
                            <HelpCircle size={16} />
                          </button>
                        )}
                        {filename && (
                          <button
                            id="dea-external-link"
                            type="button"
                            aria-label="Abrir en ventana separada"
                            className="grid place-items-center rounded hover:bg-blue-600/50 active:scale-95 transition px-1"
                            onClick={() => {
                              if (blobUrl && contentType)
                                spawnWindow(filename, blobUrl, contentType);
                            }}
                          >
                            <ExternalLink size={16} className="cursor-pointer" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                      {contentType?.includes('pdf') ? (
                        <iframe src={blobUrl!} className="w-full h-full" />
                      ) : (
                        textContent && (
                          <pre
                            className="
                              p-4
                              bg-gray-50
                              rounded-md
                              w-full
                              text-sm
                              overflow-y-auto
                              overflow-x-hidden
                              whitespace-pre-wrap
                              break-words
                              break-all
                            "
                          >
                            {textContent}
                          </pre>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <FloatingWindowsPortal
                windows={windows}
                closeWindow={closeWindow}
                toggleMinimize={toggleMinimize}
                updateGeometry={updateGeometry}
                bringToFront={bringToFront}
              />
            </div>
          )}

          <div className="flex w-full h-full items-center justify-center">
            {isLogoSrcLoading ? null : logoSrc ? (
              <div className="relative max-w-[600px]">
                <Image
                  src={logoSrc}
                  alt="client_logo"
                  width={500}
                  height={600}
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="h-full overflow-auto p-4 w-full">
                <p className="mb-4 text-sm font-bold text-gray-700">
                  La compañía no tiene un logo registrado, da click o arrastra el archivo en la zona
                  de abajo para subirlo
                </p>
                <UploadSingleFile
                  url={`/dea/uploadLogo?destination=/GESTION/${client}/${reference}`}
                />
              </div>
            )}
          </div>
        </div>
      </AccessGuard>
    </WindowManagerProvider>
  );
}
