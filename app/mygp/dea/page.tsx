'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import RoleGuard from '@/components/RoleGuard/RoleGuard';
import { Card } from '@/components/ui/card';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { clientsData } from '@/lib/clients/clientsData';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import useSWRImmutable from 'swr';
import DocumentCard from '@/components/Cards/DocumentCard';
import useSWRImmutableMutation from 'swr/mutation';
import { ExternalLink } from 'lucide-react';
import DEADraggableWindow from '@/components/Windows/DEADraggableWindow';
import DEAFileVisualizer from '@/components/DEAVisualizer/DEAVisualizer';
import { DEAWindowData } from '@/types/dea/deaFileVisualizerData';
import { deaModuleEvents } from '@/lib/posthog/events';
import { useAuth } from '@/hooks/useAuth';
import UploadMultipartToServer from '@/components/UploadMultipartToServer/UploadMultipartToServer';
import Image from 'next/image';

const viewerWrapperClass = 'h-full flex flex-col min-h-0 text-xs'; // <— FIXED: column + min-h-0
const viewerHeaderClass =
  'sticky top-0 bg-blue-500 p-2 text-white flex justify-between items-center z-10';

const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export default function DEA() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const {
    clientNumber: client,
    reference,
    setClientNumber,
    initialDate,
    finalDate,
    setInitialDate,
    setFinalDate,
    pdfUrl,
    setPdfUrl,
    fileName,
    setFile,
    getFilesByReferenceKey,
    resetDEAState,
  } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');
  const [clientName, setClientName] = React.useState('');
  const [subfolder, setSubfolder] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');
  const [subfolderLoading, setSubfolderLoading] = React.useState('');
  const [windows, setWindows] = React.useState<DEAWindowData[]>([]);
  const [nextId, setNextId] = React.useState(1);
  const [logoUrl, setLogoUrl] = React.useState<string | null | undefined>(undefined);

  const { trigger: triggerDigitalRecordGeneration, isMutating: isDigitalRecordGenerationMutating } =
    useSWRImmutableMutation(
      client && reference && `/dea/generateDigitalRecord?client=${client}&reference=${reference}`,
      axiosFetcher
    );

  const { data: zipBlob } = useSWRImmutable(url, axiosBlobFetcher);

  const {
    data: filesByReference,
    isValidating: isFilesByReferenceValidating,
  }: { data: getFilesByReference; isLoading: boolean; isValidating: boolean } = useSWRImmutable(
    getFilesByReferenceKey,
    axiosFetcher
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
  const hasExpDigital = React.useMemo(() => filesExpDigital.length >= 1, [filesExpDigital]);

  const { data: fileBlob, isLoading: isFileBlobLoading } = useSWRImmutable(
    client &&
      reference &&
      subfolder &&
      fileName &&
      `/dea/getFileContent?filepath=${client}/${reference}/${subfolder}/${fileName}`,
    axiosBlobFetcher
  );

  const {
    data: logoBlob,
    error: logoError,
    isLoading: isLogoBlobLoading,
  } = useSWRImmutable(client ? `/dea/getClientLogo/${client}` : null, axiosBlobFetcher, {
    revalidateOnFocus: false,
  });

  React.useEffect(() => {
    function DEAAuthSync() {
      let clientNum = '';
      if (!isAuthLoading && user) {
        clientNum = isAdmin ? '000041' : user.complete_user?.user?.company_casa_id ?? '';
        setClientNumber(clientNum);
        setClientName(clientsData.find(({ CVE_IMP }) => CVE_IMP == clientNum)?.NOM_IMP || '');
      }
    }
    DEAAuthSync();
  }, [isAuthLoading, user, setClientNumber, isAdmin]);

  React.useEffect(() => resetDEAState(), [resetDEAState]);

  React.useEffect(() => {
    if (logoError) {
      setLogoUrl(null);
      return;
    }
    if (!logoBlob) return;

    if (logoBlob.type === 'image/png') {
      const url = URL.createObjectURL(logoBlob);
      setLogoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoUrl(null);
    }
  }, [logoBlob, logoError]);

  React.useEffect(() => {
    async function parseBlob() {
      if (!fileBlob) return;

      if (fileBlob.type == 'application/pdf') {
        setFileContent('');
        const url = URL.createObjectURL(fileBlob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPdfUrl('');
        const text = await fileBlob.text();
        setFileContent(text);
      }
    }
    parseBlob();
  }, [fileBlob, setPdfUrl]);

  React.useEffect(() => {
    if (!zipBlob) return;
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${client}-${reference}-${subfolder}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setUrl('');
    URL.revokeObjectURL(downloadUrl);
    setUrl('');
    setSubfolderLoading('');
  }, [zipBlob, client, reference, subfolder]);

  React.useEffect(() => {
    function validateDates() {
      if (!initialDate || !user || isAuthLoading || !client) return;
      if (!finalDate) {
        toast.error('Selecciona una fecha de término');
        return;
      }
      const today = new Date();
      const start = new Date(initialDate);
      const end = new Date(finalDate);

      if (start > today)
        return toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
      if (end > today)
        return toast.error('La fecha de término no puede ser mayor a la fecha actual');
      if (start >= end)
        return toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de término');

      mutate(getFilesByReferenceKey);
    }
    validateDates();
  }, [initialDate, finalDate, client, reference, getFilesByReferenceKey, isAuthLoading, user]);

  const handleFileClick = (pdfUrl: string, fileContent: string, isLoading: boolean) => {
    const windowWidth = 760;
    const windowHeight = 800;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const x = (viewportWidth - windowWidth) / 2;
    const y = (viewportHeight - windowHeight) / 2;

    const data = {
      id: nextId,
      title: fileName,
      pdfUrl,
      content: fileContent,
      isLoading,
      x,
      y,
      width: windowWidth,
      height: windowHeight,
      visible: true,
      collapse: false,
    };

    setWindows((prev) => [...prev, { ...data, prev: data }]);
    setNextId((id) => id + 1);
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'DEA']}>
      <div className="h-full min-h-0">
        {reference && client && (
          <div className="h-full min-h-0">
            {isFilesByReferenceValidating && <TailwindSpinner />}
            {!isFilesByReferenceValidating && (
              <div className="flex h-full min-h-0 gap-4 overflow-hidden">
                <div className="flex flex-col min-h-0 gap-4 overflow-hidden">
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
                  <div className="min-h-0 overflow-hidden max-h-[clamp(200px,30vh,480px)]">
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

                <div className="flex flex-col min-h-0 gap-4 overflow-hidden">
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
                      filterFn={(item) => item.includes('COVE')}
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
                      filterFn={(item) => !item.includes('COVE')}
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

                <Card className="min-h-0 flex-[1.5] p-0 overflow-hidden">
                  <div className="h-full flex flex-col min-h-0 text-xs">
                    {/* Header */}
                    <div className={viewerHeaderClass}>
                      <p className="font-bold truncate">
                        Visor de Archivos{fileName ? ` - ${fileName}` : ''}
                      </p>
                      {fileName && (
                        <ExternalLink
                          className="cursor-pointer"
                          onClick={() => {
                            handleFileClick(pdfUrl, fileContent, isFileBlobLoading);
                          }}
                        />
                      )}
                    </div>

                    {/* Visualizer fills remaining space */}
                    <div className="flex-1 min-h-0 overflow-auto">
                      <DEAFileVisualizer
                        pdfUrl={pdfUrl}
                        content={fileContent}
                        isLoading={isFileBlobLoading}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {windows.map((window) => (
              <DEADraggableWindow window={window} setWindows={setWindows} key={window.id} />
            ))}
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
              <p className="mb-4">
                Tu compañía no tiene un logo registrado, arrástralo en la zona de abajo para subirlo
              </p>
              <UploadMultipartToServer
                apiEndpointPath={`/dea/uploadClientLogo/${client}`}
                placeholder="Arrastra o da click aquí para subir el logo de tu compañía en formato .png"
                mutationKey={`/dea/getClientLogo/${client}`}
              />
            </div>
          ))}
      </div>
    </RoleGuard>
  );
}
