'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import { Card } from '@/components/ui/card';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import useSWRImmutable from 'swr';
import DocumentCard from '@/components/Cards/DocumentCard';
import { ExternalLink } from 'lucide-react';
import DEADraggableWindow from '@/components/Windows/DEADraggableWindow';
import DEAFileVisualizer from '@/components/DEAVisualizer/DEAVisualizer';
import { DEAWindowData } from '@/types/dea/deaFileVisualizerData';
import { useAuth } from '@/hooks/useAuth';
import UploadMultipartToServer from '@/components/UploadMultipartToServer/UploadMultipartToServer';
import Image from 'next/image';
import { WindowManagerProvider } from '@/app/providers/WIndowManagerProvider';
import WindowsDock from '@/components/Windows/WindowsDock';
import WindowsLayer from '@/components/Windows/WindowsLayer';
import { AAP_UUID } from '@/lib/companiesUUIDs/companiesUUIDs';
import AccessGuard from '@/components/AccessGuard/AccessGuard';

const viewerHeaderClass =
  'sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center z-10';

export default function DEA() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const isAAP = !!user?.complete_user?.user?.companies?.some((c) => c.uuid === AAP_UUID);

  const {
    clientNumber: client,
    reference,
    setFilesByReference,
    setClientNumber,
    setClientName,
    subfolder,
    setSubfolder,
    initialDate,
    finalDate,
    pdfUrl,
    setPdfUrl,
    fileName,
    setFile,
  } = useDEAStore((state) => state);

  // Local state
  const [url, setUrl] = React.useState(''); // zip download endpoint
  const [fileContent, setFileContent] = React.useState('');
  const [subfolderLoading, setSubfolderLoading] = React.useState('');
  const [windows, setWindows] = React.useState<DEAWindowData[]>([]);
  const [nextId, setNextId] = React.useState(1);
  const [logoUrl, setLogoUrl] = React.useState<string | null | undefined>(undefined);
  const initDoneRef = React.useRef(false);

  // Stable SWR keys
  const filesByReferenceKey = React.useMemo(() => {
    if (!reference || !client) return null;
    return `/dea/getFilesByReference?reference=${reference}&client=${client}`;
  }, [reference, client]);

  const fileBlobKey = React.useMemo(() => {
    if (!client || !reference || !subfolder || !fileName) return null;
    return `/dea/getFileContent?filepath=${client}/${reference}/${subfolder}/${fileName}`;
  }, [client, reference, subfolder, fileName]);

  const logoKey = React.useMemo(() => {
    if (!client) return null;
    return `/dea/getClientLogo/${client}`;
  }, [client]);

  // Zip endpoint key: only fetch when we have a non-empty URL
  const zipKey = url || null;

  // SWR: Files for Reference
  const { data: filesByReference }: { data: getFilesByReference | undefined } = useSWRImmutable(
    filesByReferenceKey,
    axiosFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
      revalidateOnMount: true,
      dedupingInterval: 60 * 60 * 1000,
      shouldRetryOnError: false,
    }
  );

  const files = React.useMemo(
    () => filesByReference?.files ?? ({} as Record<string, string[]>),
    [filesByReference]
  );
  const filesCTA = React.useMemo(() => files['01-CTA-GASTOS'] ?? [], [files]);
  const filesVUCEM = React.useMemo(() => files['04-VUCEM'] ?? [], [files]);
  const filesExpAduanal = React.useMemo(() => files['02-EXPEDIENTE-ADUANAL'] ?? [], [files]);
  const filesFiscales = React.useMemo(() => files['03-FISCALES'] ?? [], [files]);
  const filesExpDigital = React.useMemo(() => files['05-EXP-DIGITAL'] ?? [], [files]);

  // SWR: File content (PDF or text)
  const { data: fileBlob, isLoading: isFileBlobLoading } = useSWRImmutable(
    fileBlobKey,
    axiosBlobFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshInterval: 0,
      shouldRetryOnError: false,
    }
  );

  // SWR: Client logo
  const {
    data: logoBlob,
    error: logoError,
    isLoading: isLogoBlobLoading,
  } = useSWRImmutable(logoKey, axiosBlobFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  // SWR: Zip download
  const { data: zipBlob } = useSWRImmutable(zipKey, axiosBlobFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  // One-time init (if you later need to sync DEA with user’s company)
  React.useEffect(() => {
    if (isAuthLoading || !user || initDoneRef.current) return;
    initDoneRef.current = true;
    // setClientNumber(...); setClientName(...); // left as-is per your original code
  }, [isAuthLoading, user, isAdmin, client, setClientNumber, setClientName, isAAP]);

  // Logo effect (with cleanup)
  React.useEffect(() => {
    if (logoError) {
      setLogoUrl(null);
      return;
    }
    if (!logoBlob) return;

    let tempUrl: string | null = null;
    if (logoBlob.type === 'image/png') {
      tempUrl = URL.createObjectURL(logoBlob);
      setLogoUrl(tempUrl);
    } else {
      setLogoUrl(null);
    }

    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [logoBlob, logoError]);

  // File viewer effect (PDF vs text)
  React.useEffect(() => {
    if (!fileBlob) return;

    let tempUrl: string | null = null;

    (async () => {
      if (fileBlob.type === 'application/pdf') {
        setFileContent('');
        tempUrl = URL.createObjectURL(fileBlob);
        setPdfUrl(tempUrl);
      } else {
        setPdfUrl('');
        const text = await fileBlob.text();
        setFileContent(text);
      }
    })();

    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [fileBlob, setPdfUrl]);

  // Zip downloading effect (single reset, safe cleanup)
  React.useEffect(() => {
    if (!zipBlob) return;

    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${client ?? 'client'}-${reference ?? 'ref'}-${subfolder ?? 'folder'}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(downloadUrl);
    setUrl(''); // single reset is enough
    setSubfolderLoading('');
  }, [zipBlob, client, reference, subfolder]);

  // Provide files count upstream (keep as-is)
  React.useEffect(() => {
    if (!filesByReference) return;
    setFilesByReference(filesByReference);
  }, [filesByReference, setFilesByReference]);

  // Date validation
  React.useEffect(() => {
    if (!initialDate || !user || isAuthLoading || !client) return;
    if (!finalDate) {
      toast.error('Selecciona una fecha de término');
      return;
    }
    const today = new Date();
    const start = new Date(initialDate);
    const end = new Date(finalDate);

    if (start > today) {
      toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
      return;
    }
    if (end > today) {
      toast.error('La fecha de término no puede ser mayor a la fecha actual');
      return;
    }
    if (start >= end) {
      toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de término');
      return;
    }
  }, [initialDate, finalDate, client, isAuthLoading, user]);

  const handleFileClick = async () => {
    // Spawn at the center of the browser
    const width = 760;
    const height = 800;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const x = (viewportWidth - width) / 2;
    const y = (viewportHeight - height) / 2;

    // Build per-window state
    let windowPdfUrl = '';
    let windowText = '';

    if (fileBlob) {
      if (fileBlob.type === 'application/pdf') {
        // 👇 New, independent URL for THIS window
        windowPdfUrl = URL.createObjectURL(fileBlob);
      } else {
        windowText = await fileBlob.text();
      }
    } else {
      // fallback to whatever you already had (optional)
      windowPdfUrl = pdfUrl || '';
      windowText = fileContent || '';
    }

    const data: DEAWindowData = {
      id: nextId,
      title: fileName,
      pdfUrl: windowPdfUrl, // <- unique per window
      content: windowText,
      isLoading: false,
      x,
      y,
      width,
      height,
      visible: true,
      collapse: false,
    };
    data.prevData = { ...data };

    setWindows((prev) => [...prev, data]);
    setNextId((id) => id + 1);
  };

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
                      files={filesCTA}
                      folder="01-CTA-GASTOS"
                      isLoading={subfolderLoading === '01-CTA-GASTOS'}
                      onDownload={() => {
                        setSubfolderLoading('01-CTA-GASTOS');
                        setSubfolder('01-CTA-GASTOS');
                        setUrl(`/dea/zip/${client}/${reference}/01-CTA-GASTOS`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('01-CTA-GASTOS');
                      }}
                      activeFile={fileName}
                    />
                  </div>

                  {/* Expediente Aduanal */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Expediente Aduanal"
                      files={filesExpAduanal}
                      isLoading={subfolderLoading === '02-EXPEDIENTE-ADUANAL'}
                      folder="02-EXPEDIENTE-ADUANAL"
                      onDownload={() => {
                        setSubfolderLoading('02-EXPEDIENTE-ADUANAL');
                        setSubfolder('02-EXPEDIENTE-ADUANAL');
                        setUrl(`/dea/zip/${client}/${reference}/02-EXPEDIENTE-ADUANAL`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('02-EXPEDIENTE-ADUANAL');
                      }}
                      activeFile={fileName}
                    />
                  </div>

                  {/* Comprobantes Fiscales */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Comprobantes Fiscales"
                      files={filesFiscales}
                      isLoading={subfolderLoading === '03-FISCALES'}
                      folder="03-FISCALES"
                      onDownload={() => {
                        setSubfolderLoading('03-FISCALES');
                        setSubfolder('03-FISCALES');
                        setUrl(`/dea/zip/${client}/${reference}/03-FISCALES`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('03-FISCALES');
                      }}
                      activeFile={fileName}
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
                      files={filesVUCEM}
                      isLoading={subfolderLoading === '04-VUCEM-COVES'}
                      folder="04-VUCEM"
                      onDownload={() => {
                        setSubfolderLoading('04-VUCEM-COVES');
                        setSubfolder('04-VUCEM');
                        setUrl(`/dea/zip/${client}/${reference}/04-VUCEM`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('04-VUCEM');
                      }}
                      activeFile={fileName}
                      filterFn={(item) => item.includes('COVE') || item.includes('PSIM')}
                    />
                  </div>

                  {/* EDocs */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="EDocs"
                      files={filesVUCEM}
                      isLoading={subfolderLoading === '04-VUCEM-EDOCS'}
                      folder="04-VUCEM"
                      onDownload={() => {
                        setSubfolderLoading('04-VUCEM-EDOCS');
                        setSubfolder('04-VUCEM');
                        setUrl(`/dea/zip/${client}/${reference}/04-VUCEM`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('04-VUCEM');
                      }}
                      activeFile={fileName}
                      filterFn={(item) => !item.includes('COVE') && !item.includes('PSIM')}
                    />
                  </div>

                  {/* Expediente Digital */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DocumentCard
                      className="h-full min-h-0"
                      title="Expediente Digital"
                      files={filesExpDigital}
                      isLoading={subfolderLoading === '05-EXP-DIGITAL'}
                      folder="05-EXP-DIGITAL"
                      onDownload={() => {
                        setSubfolderLoading('05-EXP-DIGITAL');
                        setSubfolder('05-EXP-DIGITAL');
                        setUrl(`/dea/zip/${client}/${reference}/05-EXP-DIGITAL`);
                      }}
                      onFileSelect={(item) => {
                        setFile(item);
                        setSubfolder('05-EXP-DIGITAL');
                      }}
                      activeFile={fileName}
                    />
                  </div>
                </div>

                {/* VIEWER */}
                <Card className="flex-[5] min-h-0 p-0 overflow-hidden rounded-none">
                  <div className="h-full flex flex-col min-h-0 text-xs">
                    <div className={viewerHeaderClass}>
                      <p className="font-bold truncate">
                        Visor de Archivos{fileName ? ` - ${fileName}` : ''}
                      </p>
                      {fileName && (
                        <ExternalLink
                          size={16}
                          className="cursor-pointer"
                          onClick={handleFileClick}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto">
                      <DEAFileVisualizer
                        content={fileContent}
                        isLoading={isFileBlobLoading}
                        pdfUrl={pdfUrl}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <WindowsLayer>
                {windows.map((w) => (
                  <DEADraggableWindow key={w.id} draggableWindow={w} setWindows={setWindows} />
                ))}
              </WindowsLayer>
              <WindowsDock windows={windows} setWindows={setWindows} />
            </div>
          )}

          {client &&
            !reference &&
            (logoUrl === undefined || isLogoBlobLoading ? null : logoUrl ? (
              <div className="flex w-full h-full items-center justify-center">
                <div className="relative max-w-[600px]">
                  <Image
                    src={logoUrl}
                    alt="client_logo"
                    width={500}
                    height={600}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto p-4">
                <p className="mb-4 text-sm font-bold text-gray-700">
                  La compañía no tiene un logo registrado, da click o arrastra el archivo en la zona
                  de abajo para subirlo
                </p>
                <UploadMultipartToServer
                  apiEndpointPath={`/dea/uploadClientLogo/${client}`}
                  placeholder="Arrastra o da click aquí para subir el logo de tu compañía en formato .png"
                  mutationKey={`/dea/getClientLogo/${client}`}
                />
              </div>
            ))}
        </div>
      </AccessGuard>
    </WindowManagerProvider>
  );
}
