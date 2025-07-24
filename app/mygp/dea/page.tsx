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
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';

const cardClassName = 'h-[240px] py-0 rounded-md';
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
  } = useDEAStore((state) => state);

  const [url, setUrl] = React.useState('');
  const [clientName, setClientName] = React.useState(
    clientsData.find((client) => client.CVE_IMP == clientNumber)?.NOM_IMP || ''
  );
  const [clickedFile, setClickedFile] = React.useState('');
  const [subfolder, setSubfolder] = React.useState('');
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');

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
      clickedFile &&
      `/dea/getFileContent?filepath=${clientNumber}/${reference}/${subfolder}/${clickedFile}`,
    axiosBlobFetcher
  );

  const { data: zipBlob } = useSWRImmutable(url, axiosBlobFetcher);
  const [subfolderLoading, setSubfolderLoading] = React.useState('');

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
  }, [fileBlob]);

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
  }, [initialDate, finalDate, clientName, clientNumber]);

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <div className="flex mb-5">
        <div className="mr-5">
          <InitialDatePicker
            date={initialDate}
            setDate={setInitialDate}
            onSelect={() => {
              setClickedFile('');
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
              setClickedFile('');
              setSubfolder('');
              setPdfUrl('');
            }}
          />
        </div>
        <div>
          <ClientsCombo
            clientName={clientName}
            setClientName={setClientName}
            setClientNumber={setClientNumber}
            onSelect={() => {
              setClickedFile('');
              setSubfolder('');
              setPdfUrl('');
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">
                {reference && data
                  ? `Cuenta de Gastos - ${data?.files['01-CTA-GASTOS']?.length || 0} archivos`
                  : 'Cuenta de Gastos'}
              </p>
              <div>
                {reference &&
                  (subfolderLoading !== '01-CTA-GASTOS' ? (
                    <DownloadIcon
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setSubfolderLoading('01-CTA-GASTOS');
                        setSubfolder('01-CTA-GASTOS');
                        setUrl(`/dea/zip/${clientNumber}/${reference}/01-CTA-GASTOS`);
                      }}
                    />
                  ) : (
                    <TailwindSpinner className="w-6 h-6" />
                  ))}
              </div>
            </div>
            <div className="p-2 break-words">
              {data?.files['01-CTA-GASTOS']?.map((item) => (
                <p
                  className={
                    clickedFile === item
                      ? 'bg-green-300 cursor-pointer mb-1'
                      : 'cursor-pointer mb-1 even:bg-gray-200'
                  }
                  key={item}
                  onClick={() => {
                    setClickedFile(item);
                    setSubfolder('01-CTA-GASTOS');
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </Card>
        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">
                {reference && data
                  ? `COVES - ${
                      data?.files['04-VUCEM']?.filter((file: { name: string } | string) =>
                        (typeof file === 'string' ? file : file.name).includes('COVE')
                      ).length || 0
                    } archivos`
                  : 'COVES'}
              </p>
              <div>
                {reference &&
                  (subfolderLoading !== '04-VUCEM-COVES' ? (
                    <DownloadIcon
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setSubfolderLoading('04-VUCEM-COVES');
                        setSubfolder('04-VUCEM');
                        setUrl(`/dea/zip/${clientNumber}/${reference}/04-VUCEM`);
                      }}
                    />
                  ) : (
                    <TailwindSpinner className="w-6 h-6" />
                  ))}
              </div>
            </div>
            <div className="p-2 break-words">
              {data?.files['04-VUCEM']?.map((item) => {
                if (item.includes('COVE'))
                  return (
                    <p
                      className={
                        clickedFile == item
                          ? 'bg-green-300 cursor-pointer mb-1'
                          : 'cursor-pointer mb-1 even:bg-gray-200'
                      }
                      key={item}
                      onClick={() => {
                        setClickedFile(item);
                        setSubfolder('04-VUCEM');
                      }}
                    >
                      {item}
                    </p>
                  );
              })}
            </div>
          </div>
        </Card>
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

        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">
                {reference && data
                  ? `Expediente Aduanal - ${
                      data?.files['02-EXPEDIENTE-ADUANAL']?.length || 0
                    } archivos`
                  : 'Expediente Aduanal'}
              </p>
              <div>
                {reference &&
                  (subfolderLoading !== '02-EXPEDIENTE-ADUANAL' ? (
                    <DownloadIcon
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setSubfolderLoading('02-EXPEDIENTE-ADUANAL');
                        setSubfolder('02-EXPEDIENTE-ADUANAL');
                        setUrl(`/dea/zip/${clientNumber}/${reference}/02-EXPEDIENTE-ADUANAL`);
                      }}
                    />
                  ) : (
                    <TailwindSpinner className="w-6 h-6" />
                  ))}
              </div>
            </div>
            <div className="p-2 break-words">
              {data?.files['02-EXPEDIENTE-ADUANAL']?.map((item) => {
                return (
                  <p
                    className={
                      clickedFile == item
                        ? 'bg-green-300 cursor-pointer mb-1'
                        : 'cursor-pointer mb-1 even:bg-gray-200'
                    }
                    key={item}
                    onClick={() => {
                      setClickedFile(item);
                      setSubfolder('02-EXPEDIENTE-ADUANAL');
                    }}
                  >
                    {item}
                  </p>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">
                {reference && data
                  ? `EDocs - ${
                      data?.files['04-VUCEM']?.filter(
                        (file: { name: string } | string) =>
                          !(typeof file === 'string' ? file : file.name).includes('COVE')
                      ).length || 0
                    } archivos`
                  : 'EDocs'}
              </p>
              <div>
                {reference &&
                  (subfolderLoading !== '04-VUCEM-EDOCS' ? (
                    <DownloadIcon
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setSubfolderLoading('04-VUCEM-EDOCS');
                        setSubfolder('04-VUCEM');
                        setUrl(`/dea/zip/${clientNumber}/${reference}/04-VUCEM`);
                      }}
                    />
                  ) : (
                    <TailwindSpinner className="w-6 h-6" />
                  ))}
              </div>
            </div>
            <div className="p-2 break-words">
              {data?.files['04-VUCEM']?.map((item) => {
                if (!item.includes('COVE'))
                  return (
                    <p
                      className={
                        clickedFile == item
                          ? 'bg-green-300 cursor-pointer mb-1'
                          : 'cursor-pointer mb-1   even:bg-gray-200'
                      }
                      key={item}
                      onClick={() => {
                        setClickedFile(item);
                        setSubfolder('04-VUCEM');
                      }}
                    >
                      {item}
                    </p>
                  );
              })}
            </div>
          </div>
        </Card>
        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">
                {reference && data
                  ? `Comprobantes Fiscales - ${data?.files['03-FISCALES']?.length || 0} archivos`
                  : 'Comprobantes Fiscales'}
              </p>
              <div>
                {reference &&
                  (subfolderLoading !== '03-FISCALES' ? (
                    <DownloadIcon
                      size={20}
                      className="cursor-pointer"
                      onClick={() => {
                        setSubfolderLoading('03-FISCALES');
                        setSubfolder('03-FISCALES');
                        setUrl(`/dea/zip/${clientNumber}/${reference}/03-FISCALES`);
                      }}
                    />
                  ) : (
                    <TailwindSpinner className="w-6 h-6" />
                  ))}
              </div>
            </div>
            <div className="p-2 break-words">
              {data?.files['03-FISCALES']?.map((item) => {
                return (
                  <p
                    className={
                      clickedFile == item
                        ? 'bg-green-300 cursor-pointer mb-1'
                        : 'cursor-pointer mb-1 even:bg-gray-200'
                    }
                    key={item}
                    onClick={() => {
                      setClickedFile(item);
                      setSubfolder('03-FISCALES');
                    }}
                  >
                    {item}
                  </p>
                );
              })}
            </div>
          </div>
        </Card>
        <Card className={cardClassName}>
          <div className={cardHeaderClassName}>
            <div className={stickyClassName}>
              <p className="font-bold">Expediente Digital</p>
            </div>
          </div>
          <div className="p-2 break-words"></div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
