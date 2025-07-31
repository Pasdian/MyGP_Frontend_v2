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
import { ADMIN_ROLE_UUID, DEA_ROLE_UUID } from '@/lib/roles/roles';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
import DocumentCard from '@/components/Cards/DocumentCard';
import PreviosDialog from '@/components/Dialogs/PreviosDialog';

const cardHeaderClassName = 'h-full overflow-y-auto text-xs';
const stickyClassName = 'sticky top-0 bg-blue-500 p-2 text-white flex justify-between items-center';

export default function DEA() {
  const {
    clientNumber,
    reference,
    setClientNumber,
    initialDate,
    finalDate,
    setInitialDate,
    setFinalDate,
    pdfUrl,
    setPdfUrl,
    file,
    setFile,
  } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');
  const [clientName, setClientName] = React.useState(
    clientsData.find((client) => client.CVE_IMP == clientNumber)?.NOM_IMP || ''
  );
  const [subfolder, setSubfolder] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');
  const [subfolderLoading, setSubfolderLoading] = React.useState('');

  const { data }: { data: getFilesByReference; isLoading: boolean; error: unknown } =
    useSWRImmutable(
      reference &&
        clientNumber &&
        `/dea/getFilesByReference?reference=${reference}&client=${clientNumber}`,
      axiosFetcher
    );

  const { data: fileBlob, isLoading: isFileBlobLoading } = useSWRImmutable(
    clientNumber &&
      reference &&
      subfolder &&
      file &&
      `/dea/getFileContent?filepath=${clientNumber}/${reference}/${subfolder}/${file}`,
    axiosBlobFetcher
  );

  const { data: zipBlob } = useSWRImmutable(url, axiosBlobFetcher);

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
    a.download = `${clientNumber}-${reference}-${subfolder}.zip`;
    console.log(a.download);
    document.body.appendChild(a);
    a.click();
    a.remove();

    setUrl('');
    URL.revokeObjectURL(downloadUrl);

    // Reset URL to allow re-download on next click
    setUrl('');
    setSubfolderLoading('');
  }, [zipBlob, clientNumber, reference, subfolder]);

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

      mutate(
        `/api/casa/getRefsByClient?client=${clientNumber}&initialDate=${initialDate}&finalDate=${finalDate}`
      );
      mutate(`/api/casa/getRefsByClient?client=${clientNumber}`);
      mutate(`/dea/getFilesByReference?reference=${reference}&client=${clientNumber}`, undefined);
    }

    validateDates();
  }, [initialDate, finalDate, clientName, clientNumber, reference]);

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID, DEA_ROLE_UUID]}>
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
        <div className="mt-5">{reference && <PreviosDialog key={reference} />}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DocumentCard
          title="Cuenta de Gastos"
          files={data?.files['01-CTA-GASTOS'] || []}
          isLoading={subfolderLoading === '01-CTA-GASTOS'}
          onDownload={() => {
            setSubfolderLoading('01-CTA-GASTOS');
            setSubfolder('01-CTA-GASTOS');
            setUrl(`/dea/zip/${clientNumber}/${reference}/01-CTA-GASTOS`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('01-CTA-GASTOS');
          }}
          activeFile={file}
        />

        <DocumentCard
          title="COVES"
          files={data?.files['04-VUCEM'] || []}
          isLoading={subfolderLoading === '04-VUCEM-COVES'}
          onDownload={() => {
            setSubfolderLoading('04-VUCEM-COVES');
            setSubfolder('04-VUCEM');
            setUrl(`/dea/zip/${clientNumber}/${reference}/04-VUCEM`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('04-VUCEM');
          }}
          activeFile={file}
          filterFn={(item) => item.includes('COVE')}
        />

        <Card className="sm:col-span-2 row-span-3 py-0">
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">Visor de Archivos</p>
            </div>
            {isFileBlobLoading && (
              <div className="w-full h-[720px] flex justify-center items-center">
                <TailwindSpinner />
              </div>
            )}
            {fileContent && !isFileBlobLoading && (
              <div className="w-full h-[720px] overflow-y-auto">
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    background: '#f6f8fa',
                    padding: '1rem',
                    wordBreak: 'break-word',
                  }}
                >
                  {fileContent}
                </pre>
              </div>
            )}

            {pdfUrl && !isFileBlobLoading && (
              <div className="w-full h-[720px]">
                <iframe
                  src={pdfUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="PDF Viewer"
                />
              </div>
            )}
          </div>
        </Card>

        <DocumentCard
          title="Expediente Aduanal"
          files={data?.files['02-EXPEDIENTE-ADUANAL'] || []}
          isLoading={subfolderLoading === '02-EXPEDIENTE-ADUANAL'}
          onDownload={() => {
            setSubfolderLoading('02-EXPEDIENTE-ADUANAL');
            setSubfolder('02-EXPEDIENTE-ADUANAL');
            setUrl(`/dea/zip/${clientNumber}/${reference}/02-EXPEDIENTE-ADUANAL`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('02-EXPEDIENTE-ADUANAL');
          }}
          activeFile={file}
        />

        <DocumentCard
          title="EDocs"
          files={data?.files['04-VUCEM'] || []}
          isLoading={subfolderLoading === '04-VUCEM-EDOCS'}
          onDownload={() => {
            setSubfolderLoading('04-VUCEM-EDOCS');
            setSubfolder('04-VUCEM');
            setUrl(`/dea/zip/${clientNumber}/${reference}/04-VUCEM`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('04-VUCEM');
          }}
          activeFile={file}
          filterFn={(item) => !item.includes('COVE')}
        />

        <DocumentCard
          title="Comprobantes Fiscales"
          files={data?.files['03-FISCALES'] || []}
          isLoading={subfolderLoading === '03-FISCALES'}
          onDownload={() => {
            setSubfolderLoading('03-FISCALES');
            setSubfolder('03-FISCALES');
            setUrl(`/dea/zip/${clientNumber}/${reference}/03-FISCALES`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('03-FISCALES');
          }}
          activeFile={file}
        />

        <DocumentCard
          title="Expediente Digital"
          files={data?.files['05-EXP-DIGITAL'] || []}
          isLoading={subfolderLoading === '05-EXP-DIGITAL'}
          onDownload={() => {
            setSubfolderLoading('05-EXP-DIGITAL');
            setSubfolder('05-EXP-DIGITAL');
            setUrl(`/dea/zip/${clientNumber}/${reference}/05-EXP-DIGITAL`);
          }}
          onFileSelect={(item) => {
            setFile(item);
            setSubfolder('05-EXP-DIGITAL');
          }}
          activeFile={file}
        />
      </div>
    </ProtectedRoute>
  );
}
