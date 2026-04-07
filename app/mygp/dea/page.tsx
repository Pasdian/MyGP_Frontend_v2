'use client';

import { useDEAParams } from '@/hooks/useDEAParams';
import { useDEAContext } from '@/app/providers/dea-store-provider';
import { Card } from '@/components/ui/card';
import React from 'react';
import DocumentCard from '@/components/Cards/DocumentCard';
import Image from 'next/image';
import useFilesByRef from '@/hooks/useFilesByRef';
import { useClientLogo } from '@/hooks/useClientLogo';
import { useClientFile } from '@/hooks/useClientFile';
import UploadFile from '@/components/UploadFiles/UploadFile';
import DEAFloatingWindowDriver from '@/components/driver/DEAFloatingWindowDriver';
import { Loader2Icon } from 'lucide-react';

export default function DEA() {
  const { client, reference, folder, file: activeFile, setActiveFile } = useDEAParams();
  const { filesByReference, setFilesByReference, setPdfUrl, setTextContent, textContent } =
    useDEAContext();

  const { refs: fetchedFiles, isLoading: isFilesByRefLoading } = useFilesByRef(
    reference || null,
    client || null
  );

  React.useEffect(() => {
    if (!isFilesByRefLoading && fetchedFiles) {
      setFilesByReference(fetchedFiles);
    }
  }, [fetchedFiles, isFilesByRefLoading, setFilesByReference]);

  const CTA = filesByReference?.files?.['01-CTA-GASTOS'] ?? [];
  const ExpAduanal = filesByReference?.files?.['02-EXPEDIENTE-ADUANAL'] ?? [];
  const Fiscales = filesByReference?.files?.['03-FISCALES'] ?? [];
  const VUCEM = filesByReference?.files?.['04-VUCEM'] ?? [];
  const ExpDigital = filesByReference?.files?.['05-EXP-DIGITAL'] ?? [];

  const {
    fileUrl,
    contentType,
    isLoading: isViewerContentLoading,
  } = useClientFile(client || null, reference || null, folder || null, activeFile || null);

  const isPdf = React.useMemo(() => {
    const ct = contentType?.toLowerCase() ?? '';
    const name = activeFile?.toLowerCase() ?? '';
    return ct.includes('pdf') || name.endsWith('.pdf');
  }, [contentType, activeFile]);

  const isImage = React.useMemo(() => {
    const ct = contentType?.toLowerCase() ?? '';
    const name = activeFile?.toLowerCase() ?? '';
    return ct.includes('image/') || /\.(jpg|jpeg|png)$/i.test(name);
  }, [contentType, activeFile]);

  React.useEffect(() => {
    if (!fileUrl) {
      return;
    }

    // PDFs are handled by iframe / new window; images are rendered natively — no need to fetch as text
    if (isPdf || isImage) {
      setTextContent(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        if (!cancelled) {
          setTextContent(text);
        }
      } catch (err) {
        console.error('Error reading text content:', err);
        if (!cancelled) {
          setTextContent('Error reading file contents');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, isPdf, isImage, setTextContent]);

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
    <>
      {reference && client ? (
        <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(0,20%)_minmax(0,20%)_minmax(0,60%)] 2xl:grid-rows-3">
          {/* Cuenta de Gastos */}
          <DocumentCard
            title="Cuenta de Gastos"
            files={CTA}
            currentFolder="01-CTA-GASTOS"
            isLoading={isFilesByRefLoading}
            onFileSelect={(item) => {
              setActiveFile('01-CTA-GASTOS', item);
            }}
          />

          {/* COVES */}
          <DocumentCard
            title="COVES"
            files={VUCEM}
            isLoading={isFilesByRefLoading}
            currentFolder="04-VUCEM"
            onFileSelect={(item) => {
              setActiveFile('04-VUCEM', item);
            }}
            filterFn={(item) => item.includes('COVE') || item.includes('PSIM')}
          />

          {/* VIEWER */}
          <Card className="order-first h-[58vh] min-h-[360px] p-0 sm:h-[78vh] md:h-[86vh] lg:col-span-2 2xl:order-none 2xl:col-start-3 2xl:row-span-3 2xl:row-start-1 2xl:h-full 2xl:min-h-0">
            <div className="grid h-full min-h-0 grid-rows-[auto_1fr]">
              <div className="flex items-center justify-between gap-2 bg-blue-500 p-2 text-[10px] text-white">
                <p className="min-w-0 text-[13px] font-bold truncate">
                  Visor de Archivos{activeFile ? ` - ${activeFile}` : ''}
                </p>
                <div className="flex items-center gap-2">
                  {activeFile && fileUrl && (
                    <DEAFloatingWindowDriver filename={activeFile} spawnWindow={spawnWindow} />
                  )}
                </div>
              </div>

              <div className="h-full min-h-0 w-full overflow-x-hidden">
                {isViewerContentLoading ? (
                  <div className="flex h-full min-h-[240px] w-full items-center justify-center text-gray-400 2xl:min-h-0">
                    <Loader2Icon className="animate-spin" />
                  </div>
                ) : isImage && fileUrl ? (
                  <img
                    src={fileUrl}
                    alt={activeFile ?? ''}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : isPdf && fileUrl ? (
                  <iframe
                    src={withPdfParams(fileUrl, { showToolbar: true })}
                    className="h-full min-h-[240px] w-full border-none 2xl:min-h-0"
                    title="PDF"
                    allow="fullscreen"
                    allowFullScreen
                  />
                ) : textContent ? (
                  <pre
                    className="
            p-3
            bg-gray-50
            w-full
            h-full
            min-h-[240px]
            text-xs
            overflow-y-auto
            overflow-x-hidden
            whitespace-pre-wrap
            break-words
            sm:p-4
            sm:text-sm
            2xl:min-h-0
          "
                  >
                    {textContent}
                  </pre>
                ) : (
                  <div className="flex h-full min-h-[240px] w-full items-center justify-center px-4 text-center text-gray-400 text-sm 2xl:min-h-0">
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
              setActiveFile('02-EXPEDIENTE-ADUANAL', item);
            }}
          />

          {/* EDocs */}
          <DocumentCard
            title="EDocs"
            files={VUCEM}
            isLoading={isFilesByRefLoading}
            currentFolder="04-VUCEM"
            onFileSelect={(item) => {
              setActiveFile('04-VUCEM', item);
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
              setActiveFile('03-FISCALES', item);
            }}
          />

          {/* Expediente Digital */}
          <DocumentCard
            title="Expediente Digital"
            files={ExpDigital}
            isLoading={isFilesByRefLoading}
            currentFolder="05-EXP-DIGITAL"
            onFileSelect={(item) => {
              setActiveFile('05-EXP-DIGITAL', item);
            }}
          />
        </div>
      ) : (
        <div className="flex w-full h-full items-center justify-center">
          <ClientLogoSection client={client} />
        </div>
      )}
    </>
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
          <UploadFile
            to={`/GESTION/${client}`}
            url="/pyapi/dea/uploadLogo"
            onUploaded={handleUploaded}
          />
        </div>
      )}
    </div>
  );
}
