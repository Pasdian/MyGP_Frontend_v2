'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import RoleGuard from '@/components/RoleGuard/RoleGuard';
import { Card } from '@/components/ui/card';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { clientsData } from '@/lib/clients/clientsData';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
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

const viewerHeaderClass =
  'sticky top-0 bg-blue-500 p-1 text-[10px] text-white flex justify-between items-center z-10';

export default function DEA() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const isAAP = user?.complete_user.user.company_uuid === AAP_UUID;
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
    getFilesByReferenceKey,
  } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');
  const [subfolderLoading, setSubfolderLoading] = React.useState('');
  const [windows, setWindows] = React.useState<DEAWindowData[]>([]);
  const [nextId, setNextId] = React.useState(1);
  const [logoUrl, setLogoUrl] = React.useState<string | null | undefined>(undefined);

  const { data: zipBlob } = useSWRImmutable(url, axiosBlobFetcher);

  const { data: filesByReference }: { data: getFilesByReference } = useSWRImmutable(
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

  const initDoneRef = React.useRef(false);

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

  // Effect for sync DEA with user company
  React.useEffect(() => {
    if (isAuthLoading || !user || initDoneRef.current) return;

    const clientNum = isAdmin || isAAP ? '000041' : user.complete_user?.user?.company_casa_id ?? '';
    if (!client) {
      setClientNumber(clientNum);
      setClientName(clientsData.find(({ CVE_IMP }) => CVE_IMP == clientNum)?.NOM_IMP || '');
    }
    initDoneRef.current = true;
  }, [isAuthLoading, user, isAdmin, client, setClientNumber, setClientName, isAAP]);

  // View logo effect
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

  // Pdf viewer effect
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

  // Zip downloading effect
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

  // State for the site header to track the number of Expediente Digital files
  React.useEffect(() => {
    setFilesByReference(filesByReference);
  }, [files, filesByReference, setFilesByReference]);

  // Validate dates effect
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
    const width = 760;
    const height = 800;

    const data = {
      id: nextId,
      title: fileName,
      pdfUrl,
      content: fileContent,
      isLoading,
      x: 0,
      y: 0,
      width,
      height,
      visible: true,
      collapse: false,
    };

    setWindows((prev) => [...prev, { ...data, prev: data }]);
    setNextId((id) => id + 1);
  };

  return (
    <WindowManagerProvider>
      <RoleGuard allowedRoles={['ADMIN', 'DEA']}>
        <div className="h-full min-h-0">
          {reference && client && (
            <div className="h-full min-h-0">
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

                <Card className="min-h-0 flex-[1.5] p-0 overflow-hidden rounded-none">
                  <div className="h-full flex flex-col min-h-0 text-xs">
                    <div className={viewerHeaderClass}>
                      <p className="font-bold truncate">
                        Visor de Archivos{fileName ? ` - ${fileName}` : ''}
                      </p>
                      {fileName && (
                        <ExternalLink
                          size={16}
                          className="cursor-pointer"
                          onClick={() => {
                            console.log('click');
                            handleFileClick(pdfUrl, fileContent, isFileBlobLoading);
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-auto">
                      <DEAFileVisualizer content={fileContent} isLoading={isFileBlobLoading} />
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
      </RoleGuard>
    </WindowManagerProvider>
  );
}
