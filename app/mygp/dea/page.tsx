'use client';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { Card } from '@/components/ui/card';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosBlobFetcher, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { ADMIN_ROLE_UUID } from '@/lib/roles/roles';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import React from 'react';
import useSWRImmutable from 'swr/immutable';
const cardClassName = 'relative py-0 gap-0 text-xs overflow-y-auto';
const stickyClassName = 'sticky top-0 right-0 left-0';
const cardHeaderClassName = 'font-bold bg-blue-400 p-2 text-white text-center';

export default function DEA() {
  const [pdfUrl, setPdfUrl] = React.useState('');
  const { data, isLoading }: { data: getFilesByReference; isLoading: boolean } = useSWRImmutable(
    '/dea/getFilesByReference?reference=PAI251974&client=000041',
    axiosFetcher
  );

  const { data: myBlob } = useSWRImmutable(
    '/dea/getFileContent?filepath=000041/PAI251974/01-CTA-GASTOS/PAI251974_AAPP7529.PDF',
    axiosBlobFetcher
  );

  React.useEffect(() => {
    if (!myBlob) return;

    if (myBlob.type !== 'application/pdf') {
      myBlob.text().then(console.error); // log JSON error
      return;
    }

    const url = URL.createObjectURL(myBlob);
    setPdfUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [myBlob]);

  if (isLoading) return <TailwindSpinner />;
  return (
    <ProtectedRoute allowedRoles={[ADMIN_ROLE_UUID]}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Cuenta de Gastos</p>
          </div>
          <div className="p-2 break-words">
            {data.files['01-CTA-GASTOS'].map((item) => {
              return (
                <p className="cursor-pointer mb-1 odd:bg-white even:bg-gray-200" key={item}>
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
            {data.files['04-VUCEM'].map((item) => {
              if (item.includes('COVE'))
                return (
                  <p className="cursor-pointer mb-1 odd:bg-white even:bg-gray-200" key={item}>
                    {item}
                  </p>
                );
            })}
          </div>
        </Card>
        <Card className={`sm:col-span-2 row-span-3 ${cardClassName}`}>
          <p className={cardHeaderClassName}>Visor de Archivos</p>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Viewer"
            />
          ) : (
            <p className="mt-4 ml-4">Selecciona un archivo para visualizarlo</p>
          )}
        </Card>

        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Expediente Aduanal</p>
          </div>
          <div className="p-2 break-words">
            {data.files['02-EXPEDIENTE-ADUANAL'].map((item) => {
              return (
                <p className="cursor-pointer mb-1 odd:bg-white even:bg-gray-200" key={item}>
                  {item}
                </p>
              );
            })}
          </div>
        </Card>

        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>EDocs</p>
          </div>
          <div className="p-2 break-words">
            {data.files['04-VUCEM'].map((item) => {
              if (!item.includes('COVE'))
                return (
                  <p className="cursor-pointer mb-1 odd:bg-white even:bg-gray-200" key={item}>
                    {item}
                  </p>
                );
            })}
          </div>
        </Card>
        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Comprobantes Fiscales</p>
          </div>
          <div className="p-2 break-words">
            {data.files['03-FISCALES'].map((item) => {
              return (
                <p className="cursor-pointer mb-1 odd:bg-white even:bg-gray-200" key={item}>
                  {item}
                </p>
              );
            })}
          </div>
        </Card>
        <Card className={`h-[250px] ${cardClassName}`}>
          <div className={stickyClassName}>
            <p className={cardHeaderClassName}>Expediente Digital</p>
          </div>
          <div className="p-2 break-words"></div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
