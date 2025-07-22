'use client';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import ClientsCombo from '@/components/comboboxes/ClientsCombo';
import FinalDatePicker from '@/components/datepickers/FinalDatePicker';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Card } from '@/components/ui/card';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import useSWRImmutable from 'swr/immutable';
const cardClassName = 'relative py-0 gap-0 text-xs overflow-y-auto';
const stickyClassName = 'sticky top-0 right-0 left-0';
const cardHeaderClassName = 'font-bold bg-blue-400 p-2 text-white text-center';

export default function DEA() {
  const {
    clientNumber: deaClientNumber,
    reference,
    setClientNumber: setDEAClientNumber,
    initialDate: DEAInitialDate,
    finalDate: DEAFinalDate,
    setInitialDate: setDEAInitialDate,
    setFinalDate: setDEAFinalDate,
  } = useDEAStore((state) => state);

  const [clientName, setClientName] = React.useState('');
  const [clickedFile, setClickedFile] = React.useState('');
  const [folder, setFolder] = React.useState('');
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [fileContent, setFileContent] = React.useState('');

  const { data }: { data: getFilesByReference; isLoading: boolean; error: unknown } =
    useSWRImmutable(
      reference &&
        deaClientNumber &&
        `/dea/getFilesByReference?reference=${reference}&client=${deaClientNumber}`,
      axiosFetcher
    );

  const { data: myBlob, isLoading: isMyBlobLoading } = useSWRImmutable(
    deaClientNumber &&
      reference &&
      folder &&
      clickedFile &&
      `/dea/getFileContent?filepath=${deaClientNumber}/${reference}/${folder}/${clickedFile}`,
    axiosBlobFetcher
  );

  React.useEffect(() => {
    async function parseBlob() {
      if (!myBlob) return;

      if (myBlob.type == 'application/pdf') {
        setFileContent('');
        const url = URL.createObjectURL(myBlob);
        setPdfUrl(url);

        return () => URL.revokeObjectURL(url);
      } else {
        setPdfUrl('');
        const text = await myBlob.text();
        setFileContent(text);
      }
    }
    parseBlob();
  }, [myBlob]);

  React.useEffect(() => {
    function validateDates() {
      const today = new Date();

      // Common mistakes that the user can do
      if (!DEAInitialDate) return;
      if (new Date(DEAInitialDate) > today) {
        toast.error('La fecha de inicio no puede ser mayor a la fecha actual');
        return;
      } else if (DEAFinalDate == undefined) {
        toast.error('Selecciona una fecha de termino');
        return;
      } else if (DEAInitialDate > DEAFinalDate) {
        toast.error('La fecha de inicio no puede ser mayor o igual que la fecha de termino');
        return;
      } else if (DEAFinalDate <= DEAInitialDate) {
        toast.error('La fecha de termino no puede ser menor o igual a la fecha de inicio');
        return;
      } else if (new Date(DEAFinalDate) > today) {
        toast.error('La fecha de termino no puede ser mayor a la fecha actual');
        return;
      } else if (!clientName) {
        toast.error('Selecciona un cliente');
        return;
      }
      mutate(
        `/api/casa/getRefsByClient?client=${deaClientNumber}&initialDate=${DEAFinalDate}&finalDate=${DEAInitialDate}`
      );
    }
    validateDates();
  }, [DEAInitialDate, DEAFinalDate, clientName, deaClientNumber]);

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <div className="flex mb-5">
        <div className="mr-5">
          <InitialDatePicker date={DEAInitialDate} setDate={setDEAInitialDate} />
        </div>
        <div className=" mr-5">
          <FinalDatePicker date={DEAFinalDate} setDate={setDEAFinalDate} />
        </div>
        <div>
          <ClientsCombo
            clientName={clientName}
            setClientName={setClientName}
            setClientNumber={setDEAClientNumber}
            onSelect={() => {
              mutate(`/api/casa/getRefsByClient?client=${deaClientNumber}`);
              setPdfUrl('');
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Cuenta de Gastos</p>
          </div>
          <div className="p-2 break-words">
            {data?.files['01-CTA-GASTOS']?.map((item) => {
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
                    setFolder('01-CTA-GASTOS');
                  }}
                >
                  {item}
                </p>
              );
            })}
          </div>
        </Card>
        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>COVES</p>
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
                      setFolder('04-VUCEM');
                    }}
                  >
                    {item}
                  </p>
                );
            })}
          </div>
        </Card>
        <Card className={`sm:col-span-2 row-span-3 ${cardClassName}`}>
          <p className={cardHeaderClassName}>Visor de Archivos</p>
          {isMyBlobLoading && (
            <div className="w-full h-[720px] flex justify-center items-center">
              <TailwindSpinner />
            </div>
          )}
          {fileContent && !isMyBlobLoading && (
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

          {pdfUrl && !isMyBlobLoading && (
            <div className="w-full h-[720px]">
              <iframe
                src={pdfUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Viewer"
              />
            </div>
          )}
        </Card>

        <Card className={`h-[230px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Expediente Aduanal</p>
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
                    setFolder('02-EXPEDIENTE-ADUANAL');
                  }}
                >
                  {item}
                </p>
              );
            })}
          </div>
        </Card>

        <Card className={`h-[230px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>EDocs</p>
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
                      setFolder('04-VUCEM');
                    }}
                  >
                    {item}
                  </p>
                );
            })}
          </div>
        </Card>
        <Card className={`h-[230px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Comprobantes Fiscales</p>
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
                    setFolder('03-FISCALES');
                  }}
                >
                  {item}
                </p>
              );
            })}
          </div>
        </Card>
        <Card className={`h-[230px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Expediente Digital</p>
          </div>
          <div className="p-2 break-words"></div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
