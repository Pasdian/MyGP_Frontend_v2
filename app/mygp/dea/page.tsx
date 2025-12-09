'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import { Card } from '@/components/ui/card';
import React from 'react';
import DocumentCard from '@/components/Cards/DocumentCard';
import Image from 'next/image';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import useFilesByRef from '@/hooks/useFilesByRef';
import { useClientLogo } from '@/hooks/useClientLogo';
import { useClientFile } from '@/hooks/useClientFile';
import UploadFile from '@/components/UploadFiles/UploadFile';
import DEAFloatingWindowDriver from '@/components/driver/DEAFloatingWindowDriver';
import { Loader2Icon } from 'lucide-react';
import { DEA_ROLES } from '@/lib/modules/moduleRole';

export default function DEA() {
  const { client, file, setFile } = useDEAStore((state) => state);

  const { refs: filesByReference, isLoading: isFilesByRefLoading } = useFilesByRef(
    client.reference,
    client.number
  );

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

  const {
    fileUrl,
    contentType,
    isLoading: isViewerContentLoading,
  } = useClientFile(client.number, client.reference, file.folder, file.activeFile);

  const isPdf = React.useMemo(() => {
    const ct = contentType?.toLowerCase() ?? '';
    const name = file.activeFile?.toLowerCase() ?? '';
    return ct.includes('pdf') || name.endsWith('.pdf');
  }, [contentType, file.activeFile]);

  React.useEffect(() => {
    if (!fileUrl) {
      return;
    }

    // PDFs are handled by iframe / new window; no need to fetch as text
    if (isPdf) {
      setFile({ textContent: null });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        if (!cancelled) {
          setFile({ textContent: text });
        }
      } catch (err) {
        console.error('Error reading text content:', err);
        if (!cancelled) {
          setFile({ textContent: '⚠️ Error reading file contents' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, isPdf, setFile]);

  const withPdfParams = (url?: string, { showToolbar = true } = {}) => {
    if (!url) return '';

    const hasHash = url.includes('#');
    const sep = hasHash ? '&' : '#';
    const toolbarParam = showToolbar ? 'toolbar=1' : 'toolbar=0';
    return `${url}${sep}zoom=page-width&view=FitH&${toolbarParam}`;
  };

  const spawnWindow = React.useCallback(() => {
    if (!fileUrl) return;

    const targetUrl = isPdf ? withPdfParams(fileUrl, { showToolbar: true }) : fileUrl;

    const popup = window.open(
      targetUrl,
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
    }
  }, [fileUrl, isPdf]);

  return (
    <AccessGuard allowedRoles={DEA_ROLES}>
      {client.reference && client.number ? (
        <div className="grid grid-cols-[20%_20%_60%] grid-rows-3 gap-2 h-full">
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
            <div className="grid grid-rows-[auto_1fr] h-full min-h-0">
              <div className="bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center">
                <p className="text-[13px] font-bold truncate">
                  Visor de Archivos{file.activeFile ? ` - ${file.activeFile}` : ''}
                </p>
                <div className="flex items-center gap-2">
                  {file.activeFile && fileUrl && (
                    <DEAFloatingWindowDriver filename={file.activeFile} spawnWindow={spawnWindow} />
                  )}
                </div>
              </div>

              <div className="w-full h-full min-h-0 overflow-x-hidden">
                {isViewerContentLoading ? (
                  <div className="flex w-full h-full items-center justify-center text-gray-400">
                    <Loader2Icon className="animate-spin" />
                  </div>
                ) : isPdf && fileUrl ? (
                  <iframe
                    src={withPdfParams(fileUrl, { showToolbar: true })}
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
            h-full
            text-sm
            overflow-y-auto
            overflow-x-hidden
            whitespace-pre-wrap
            break-words
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
        </div>
      ) : (
        <div className="flex w-full h-full items-center justify-center">
          <ClientLogoSection client={client.number} />
        </div>
      )}
    </AccessGuard>
  );
}

function ClientLogoSection({ client }: { client: string }) {
  const [version, setVersion] = React.useState(0);
  const { logoUrl, isLoading: isLogoUrlLoading } = useClientLogo(client, version);

  const handleUploaded = React.useCallback(() => {
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
