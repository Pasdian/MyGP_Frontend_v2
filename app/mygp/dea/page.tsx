'use client';
import { Card } from '@/components/ui/card';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import useSWRImmutable from 'swr/immutable';
const cardClassName = 'relative py-0 gap-0 text-xs overflow-y-auto';
const stickyClassName = 'sticky top-0 right-0 left-0';
const cardHeaderClassName = 'font-bold bg-blue-400 p-2 text-white text-center';

export default function DEA() {
  const { data, isLoading }: { data: getFilesByReference; isLoading: boolean } = useSWRImmutable(
    '/dea/getFilesByReference?reference=PAI251974&client=000041',
    axiosFetcher
  );

  if (isLoading) return <TailwindSpinner />;
  return (
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
        <div className="p-2">
          <p className="mt-4 ml-4">Selecciona un archivo para visualizarlo</p>
        </div>
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
  );
}
