'use client';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import ClientsCombo from '@/components/comboboxes/ClientsCombo';
import FinalDatePicker from '@/components/datepickers/FinalDatePicker';
import InitialDatePicker from '@/components/datepickers/InitialDatePicker';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import useSWRImmutable from 'swr/immutable';
const cardClassName = 'relative py-0 gap-0 text-xs overflow-y-auto';
const stickyClassName = 'sticky top-0 right-0 left-0';
const cardHeaderClassName = 'font-bold bg-blue-400 p-2 text-white text-center';

export default function DEA() {
  const {
    clientNumber: deaClientNumber,
    reference,
    setClientNumber: setDEAClientNumber,
  } = useDEAStore((state) => state);
  const [clientName, setClientName] = React.useState('');
  const [clickedFile, setClickedFile] = React.useState('');
  const [folder, setFolder] = React.useState('');
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [initialDate, setInitialDate] = React.useState<Date | undefined>(undefined);
  const [finalDate, setFinalDate] = React.useState<Date | undefined>(undefined);
  const [fileContent, setFileContent] = React.useState('');

  const { data }: { data: getFilesByReference; isLoading: boolean } = useSWRImmutable(
    reference &&
      deaClientNumber &&
      `/dea/getFilesByReference?reference=${reference}&client=${deaClientNumber}`,
    axiosFetcher
  );

  const { data: myBlob } = useSWRImmutable(
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

  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <div className="flex mb-5">
        <div className="mr-5">
          <InitialDatePicker date={initialDate} setDate={setInitialDate} />
        </div>
        <div className=" mr-5">
          <FinalDatePicker date={finalDate} setDate={setFinalDate} />
        </div>
        <div>
          <ClientsCombo
            clientName={clientName}
            setClientName={setClientName}
            setClientNumber={setDEAClientNumber}
            onSelect={() => {}}
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
                      : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
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
                        : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
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
          {fileContent && (
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

          {pdfUrl && (
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
                      : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
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
                        : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
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
                      : 'cursor-pointer mb-1 odd:bg-white even:bg-gray-200'
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
