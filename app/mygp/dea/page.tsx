'use client';

import { useDEAStore } from '@/app/providers/dea-store-provider';
import ClientsCombo from '@/components/comboboxes/ClientsCombo';
import FinalDatePicker from '@/components/datepickers/FinalDatePicker';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Card } from '@/components/ui/card';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { clientsData } from '@/lib/clients/clientsData';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import useSWR from 'swr';
import DocumentCard from '@/components/Cards/DocumentCard';
import PreviosDialog from '@/components/Dialogs/PreviosDialog';
import { Button } from '@/components/ui/button';
import useSWRMutation from 'swr/mutation';
import { ExternalLink, LoaderCircle, RocketIcon } from 'lucide-react';
import DEADraggableWindow from '@/components/Windows/DEADraggableWindow';
import DEAFileVisualizer from '@/components/DEAVisualizer/DEAVisualizer';
import { DEAWindowData } from '@/types/dea/deaFileVisualizerData';

const cardHeaderClassName = 'h-full overflow-y-auto text-xs';
const stickyClassName = 'sticky top-0 bg-blue-500 p-2 text-white flex justify-between items-center';

export default function DEA() {
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
  } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');
  const [clientName, setClientName] = React.useState(
    clientsData.find(({ CVE_IMP }) => CVE_IMP == client)?.NOM_IMP || ''
  );
  const [subfolder, setSubfolder] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');
  const [subfolderLoading, setSubfolderLoading] = React.useState('');
  const [windows, setWindows] = React.useState<DEAWindowData[]>([]);
  const [nextId, setNextId] = React.useState(1);

  const { trigger: triggerDigitalRecordGeneration, isMutating: isDigitalRecordGenerationMutating } =
    useSWRMutation(
      client && reference && `/dea/generateDigitalRecord?client=${client}&reference=${reference}`,
      axiosFetcher
    );

  const { data: zipBlob } = useSWR(url, axiosBlobFetcher);

  const {
    data: filesByReference,
    isValidating: isFilesByReferenceValidating,
  }: { data: getFilesByReference; isLoading: boolean; isValidating: boolean } = useSWR(
    getFilesByReferenceKey,
    axiosFetcher
  );

  const { data: fileBlob, isLoading: isFileBlobLoading } = useSWR(
    client &&
      reference &&
      subfolder &&
      fileName &&
      `/dea/getFileContent?filepath=${client}/${reference}/${subfolder}/${fileName}`,
    axiosBlobFetcher
  );

  // Effect for fileBlob
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

  // Effect for zipBlob
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

    // Reset URL to allow re-download on next click
    setUrl('');
    setSubfolderLoading('');
  }, [zipBlob, client, reference, subfolder]);

  // Effect for date validation
  React.useEffect(() => {
    function validateDates() {
      if (!initialDate) return;
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

      if (!clientName) {
        toast.error('Selecciona un cliente');
        return;
      }

      mutate(getFilesByReferenceKey);
    }

    validateDates();
  }, [initialDate, finalDate, clientName, client, reference, getFilesByReferenceKey]);

  const handleFileClick = (pdfUrl: string, fileContent: string, isLoading: boolean) => {
    // Spawn at the center of the browser
    const windowWidth = 760;
    const windowHeight = 800;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const x = (viewportWidth - windowWidth) / 2;
    const y = (viewportHeight - windowHeight) / 2;

    const data = {
      id: nextId,
      title: fileName,
      pdfUrl: pdfUrl,
      content: fileContent,
      isLoading: isLoading,
      x: x,
      y: y,
      width: windowWidth,
      height: windowHeight,
      visible: true,
      collapse: false,
    };

    const newData = {
      ...data,
      prev: data,
    };
    setWindows((prev) => [...prev, newData]);
    setNextId((id) => id + 1);
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'DEA']}>
      <div className="flex mb-5">
        <div className="mr-5">
          <InitialDatePicker
            date={initialDate}
            setDate={setInitialDate}
            onSelect={() => {
              setFile('');
              setSubfolder('');
              setPdfUrl('');
            }}
          />
        </div>
        <div className=" mr-5">
          <FinalDatePicker
            date={finalDate}
            setDate={setFinalDate}
            onSelect={() => {
              setFile('');
              setSubfolder('');
              setPdfUrl('');
            }}
          />
        </div>
        <div className="mr-5">
          <ClientsCombo
            clientName={clientName}
            setClientName={setClientName}
            setClientNumber={setClientNumber}
            onSelect={() => {
              setFile('');
              setSubfolder('');
              setPdfUrl('');
            }}
          />
        </div>
        {filesByReference && reference && (
          <div className="mt-5 mr-5">
            <PreviosDialog key={reference} />
          </div>
        )}
        {filesByReference && reference && client && (
          <Button
            className="mt-5 bg-blue-500 hover:bg-blue-600 font-bold cursor-pointer"
            onClick={async () => {
              try {
                await triggerDigitalRecordGeneration();
                mutate(getFilesByReferenceKey);
                toast.success('Expediente digital generado exitosamente');
              } catch (err) {
                console.error('Generation Failed', err);
              }
            }}
            disabled={isDigitalRecordGenerationMutating}
          >
            {isDigitalRecordGenerationMutating ? (
              <div className="flex items-center animate-pulse">
                <LoaderCircle className="animate-spin mr-2" />
                Generando
              </div>
            ) : (
              <div className="flex items-center">
                <RocketIcon className="mr-2" /> Generar Expediente Digital
              </div>
            )}
          </Button>
        )}
      </div>
      {isFilesByReferenceValidating && <TailwindSpinner />}
      {!isFilesByReferenceValidating && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DocumentCard
            title="Cuenta de Gastos"
            files={filesByReference?.files['01-CTA-GASTOS'] || []}
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

          <DocumentCard
            title="COVES"
            files={filesByReference?.files['04-VUCEM'] || []}
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

          <Card className="sm:col-span-2 row-span-3 py-0">
            <div className={cardHeaderClassName}>
              <div className={stickyClassName}>
                <p className="font-bold">Visor de Archivos - {fileName}</p>
                {fileName && (
                  <ExternalLink
                    className="cursor-pointer"
                    onClick={() => {
                      handleFileClick(pdfUrl, fileContent, isFileBlobLoading);
                    }}
                  />
                )}
              </div>
              <DEAFileVisualizer
                pdfUrl={pdfUrl}
                content={fileContent}
                isLoading={isFileBlobLoading}
              />
            </div>
          </Card>

          <DocumentCard
            title="Expediente Aduanal"
            files={filesByReference?.files['02-EXPEDIENTE-ADUANAL'] || []}
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

          <DocumentCard
            title="EDocs"
            files={filesByReference?.files['04-VUCEM'] || []}
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

          <DocumentCard
            title="Comprobantes Fiscales"
            files={filesByReference?.files['03-FISCALES'] || []}
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

          <DocumentCard
            title="Expediente Digital"
            files={filesByReference?.files['05-EXP-DIGITAL'] || []}
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
      )}
      {windows.map((window) => (
        <DEADraggableWindow window={window} setWindows={setWindows} key={window.id} />
      ))}
    </ProtectedRoute>
  );
}
