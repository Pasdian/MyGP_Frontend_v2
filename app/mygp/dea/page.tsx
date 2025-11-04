'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import { Card } from '@/components/ui/card';
import React from 'react';
import DocumentCard from '@/components/Cards/DocumentCard';
import Image from 'next/image';
import { WindowManagerProvider } from '@/app/providers/WIndowManagerProvider';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { FloatingWindowsPortal } from '@/components/portals/FloatingWindowsPortal';
import { useFloatingWindows } from '@/hooks/useFloatingWindows';
import useFilesByRef from '@/hooks/useFilesByRef';
import { useClientLogo } from '@/hooks/useClientLogo';
import { useClientFile } from '@/hooks/useClientFile';
import UploadFile from '@/components/UploadFiles/UploadFile';
import DEAFloatingWindowDriver from '@/components/driver/DEAFloatingWindowDriver';

export default function DEA() {
  const { clientNumber: client, reference, filesByReference } = useDEAStore((state) => state);
  const [subfolder, setSubfolder] = React.useState('');
  const [filename, setFilename] = React.useState('');

  // Get files by reference stream
  useFilesByRef(reference, client);

  const CTA = filesByReference.files?.['01-CTA-GASTOS'] ?? [];
  const ExpAduanal = filesByReference?.files?.['02-EXPEDIENTE-ADUANAL'] ?? [];
  const Fiscales = filesByReference?.files?.['03-FISCALES'] ?? [];
  const VUCEM = filesByReference?.files?.['04-VUCEM'] ?? [];
  const ExpDigital = filesByReference?.files?.['05-EXP-DIGITAL'] ?? [];

  // Visualizer effect and contents
  const { fileUrl, contentType } = useClientFile(client, reference, subfolder, filename);
  const [textContent, setTextContent] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!fileUrl || !contentType) return;

    // PDF? Don't read as text.
    if (contentType.includes('pdf')) {
      setTextContent(null);
      return;
    }

    // Everything else → try to read as text
    (async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        setTextContent(text);
      } catch (err) {
        console.error('Error reading text content:', err);
        setTextContent('⚠️ Error reading file contents');
      }
    })();
  }, [fileUrl, contentType]);

  // Windows hook
  const { windows, spawnWindow, closeWindow, toggleMinimize, updateGeometry, bringToFront } =
    useFloatingWindows();

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
                    <div className="sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center">
                      <p className="font-bold truncate">
                        Visor de Archivos{filename ? ` - ${filename}` : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        {filename && fileUrl && (
                          <DEAFloatingWindowDriver
                            fileUrl={fileUrl}
                            contentType={contentType}
                            filename={filename}
                            spawnWindow={spawnWindow}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                      {contentType?.includes('pdf') ? (
                        <iframe src={fileUrl!} className="w-full h-full" />
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

          {!reference && (
            <div className="flex w-full h-full items-center justify-center">
              <ClientLogoSection client={client} />
            </div>
          )}
        </div>
      </AccessGuard>
    </WindowManagerProvider>
  );
}

function ClientLogoSection({ client }: { client: string }) {
  const [version, setVersion] = React.useState(0);
  const { logoUrl, isLoading: isLogoUrlLoading } = useClientLogo(client, version);

  const handleUploaded = React.useCallback(() => {
    // bump version to force a refetch and bypass caches
    setVersion((v) => v + 1);
  }, []);

  return (
    <div className="space-y-4">
      {isLogoUrlLoading ? (
        <div className="text-sm text-gray-500 text-center">Cargando logo...</div>
      ) : logoUrl ? (
        <div className="flex justify-center">
          <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-[500px] w-full">
            <div className="flex justify-center items-center max-h-[300px] overflow-hidden">
              <Image
                src={logoUrl}
                alt="Logo del cliente"
                width={400}
                height={400}
                className="object-contain w-auto h-auto max-h-[280px] transition-transform duration-200 hover:scale-105"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 text-center">Sin logo disponible</div>
      )}

      {!logoUrl && (
        <div className="flex justify-center">
          <UploadFile to={`/GESTION/${client}`} url="/dea/uploadLogo" onUploaded={handleUploaded} />
        </div>
      )}
    </div>
  );
}
