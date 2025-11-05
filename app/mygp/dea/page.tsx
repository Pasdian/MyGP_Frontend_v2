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
import { Loader2Icon } from 'lucide-react';

export default function DEA() {
  const { client, file, setFile } = useDEAStore((state) => state);

  // Get files by reference stream
  const { refs: filesByReference, isLoading: isFilesByRefLoading } = useFilesByRef(
    client.reference,
    client.number
  );

  // Update the context if filesByReference change
  React.useEffect(() => {
    if (!isFilesByRefLoading && filesByReference) {
      setFile({ filesByReference });
    }
  }, [filesByReference, isFilesByRefLoading, setFile]);

  const CTA = file.filesByReference?.files?.['01-CTA-GASTOS'] ?? [];
  const ExpAduanal = file.filesByReference?.files?.['02-EXPEDIENTE-ADUANAL'] ?? [];
  const Fiscales = file.filesByReference?.files?.['03-FISCALES'] ?? [];
  const VUCEM = file.filesByReference?.files?.['04-VUCEM'] ?? [];
  const ExpDigital = file.filesByReference?.files?.['05-EXP-DIGITAL'] ?? [];

  // Visualizer effect and contents
  const {
    fileUrl,
    contentType,
    isLoading: isViewerContentLoading,
  } = useClientFile(client.number, client.reference, file.folder, file.activeFile);

  React.useEffect(() => {
    if (!fileUrl || !contentType) return;

    // PDF? Don't read as text.
    if (contentType.includes('pdf')) {
      setFile({ textContent: null });
      return;
    }

    // Everything else → try to read as text
    (async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        setFile({ textContent: text });
      } catch (err) {
        console.error('Error reading text content:', err);
        setFile({ textContent: '⚠️ Error reading file contents' });
      }
    })();
  }, [fileUrl, contentType, setFile]);

  // Windows hook
  const { windows, spawnWindow, closeWindow, toggleMinimize, updateGeometry, bringToFront } =
    useFloatingWindows();

  // Custom display pdf (with optional toolbar)
  const withPdfParams = (url: string, { showToolbar = true } = {}) => {
    const hasHash = url.includes('#');
    const sep = hasHash ? '&' : '#';
    const toolbarParam = showToolbar ? 'toolbar=1' : 'toolbar=0';
    // Fit to page width; keep FitH as a fallback some viewers honor
    return `${url}${sep}zoom=page-width&view=FitH&${toolbarParam}`;
  };

  return (
    <WindowManagerProvider>
      <AccessGuard allowedModules={['All Modules', 'DEA']} allowedRoles={['ADMIN', 'DEA']}>
        {client.reference && client.number ? (
          <div className="grid grid-cols-[25%_25%_50%] grid-rows-3 h-full gap-2">
            {/* Cuenta de Gastos */}
            <DocumentCard
              title="Cuenta de Gastos"
              files={CTA}
              currentFolder="01-CTA-GASTOS"
              isLoading={isFilesByRefLoading}
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '01-CTA-GASTOS' });
              }}
            />

            {/* COVES */}
            <DocumentCard
              title="COVES"
              files={VUCEM}
              isLoading={isFilesByRefLoading}
              currentFolder="04-VUCEM"
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '04-VUCEM' });
              }}
              filterFn={(item) => item.includes('COVE') || item.includes('PSIM')}
            />
            {/* VIEWER */}
            <Card className="row-span-3 p-0">
              <div className="grid grid-rows-[auto_1fr] h-full">
                {/* Header */}
                <div className="bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center">
                  <p className="text-[13px] font-bold truncate">
                    Visor de Archivos{file.activeFile ? ` - ${file.activeFile}` : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    {file.activeFile && fileUrl && (
                      <DEAFloatingWindowDriver
                        fileUrl={fileUrl}
                        contentType={contentType}
                        filename={file.activeFile}
                        spawnWindow={spawnWindow}
                      />
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="w-full h-full">
                  {isViewerContentLoading ? (
                    <div className="flex w-full h-full items-center justify-center text-gray-400">
                      <Loader2Icon className="animate-spin" />
                    </div>
                  ) : contentType?.includes('pdf') ? (
                    <iframe
                      src={withPdfParams(fileUrl!, { showToolbar: true })}
                      className="w-full h-full border-none"
                      title="PDF"
                      allow="fullscreen"
                      allowFullScreen
                    />
                  ) : file.textContent ? (
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
                      {file.textContent}
                    </pre>
                  ) : (
                    <div className="flex w-full h-full items-center justify-center text-gray-400 text-sm">
                      No hay contenido disponible
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Expediente Aduanal */}
            <DocumentCard
              title="Expediente Aduanal"
              files={ExpAduanal}
              isLoading={isFilesByRefLoading}
              currentFolder="02-EXPEDIENTE-ADUANAL"
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '02-EXPEDIENTE-ADUANAL' });
              }}
            />
            {/* EDocs */}
            <DocumentCard
              title="EDocs"
              files={VUCEM}
              isLoading={isFilesByRefLoading}
              currentFolder="04-VUCEM"
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '04-VUCEM' });
              }}
              filterFn={(item) => !item.includes('COVE') && !item.includes('PSIM')}
            />

            {/* Comprobantes Fiscales */}
            <DocumentCard
              title="Comprobantes Fiscales"
              files={Fiscales}
              currentFolder="03-FISCALES"
              isLoading={isFilesByRefLoading}
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '03-FISCALES' });
              }}
            />

            {/* Expediente Digital */}
            <DocumentCard
              title="Expediente Digital"
              files={ExpDigital}
              isLoading={isFilesByRefLoading}
              currentFolder="05-EXP-DIGITAL"
              onFileSelect={(item) => {
                setFile({ activeFile: item, folder: '05-EXP-DIGITAL' });
              }}
            />

            <FloatingWindowsPortal
              windows={windows}
              closeWindow={closeWindow}
              toggleMinimize={toggleMinimize}
              updateGeometry={updateGeometry}
              bringToFront={bringToFront}
            />
          </div>
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <ClientLogoSection client={client.number} />
          </div>
        )}
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
