import EmbarqueProvider from '@/app/providers/EmbarqueProvider';
import EmbarqueDataTable from '@/components/datatables/transbel/EmbarqueDataTable';

export default function DatosEmbarque() {
  return (
    <>
      <div>
        <p className="font-semibold text-2xl mb-4">Datos de Embarque</p>
        <EmbarqueProvider>
          <EmbarqueDataTable />
        </EmbarqueProvider>
      </div>
    </>
  );
}
