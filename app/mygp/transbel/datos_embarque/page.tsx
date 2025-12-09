import EmbarqueProvider from '@/app/providers/EmbarqueProvider';
import AccessGuard from '@/components/AccessGuard/AccessGuard';
import EmbarqueDataTable from '@/components/datatables/transbel/EmbarqueDataTable';
import { DATOS_EMBARQUE_ROLES } from '@/lib/modules/moduleRole';

export default function DatosEmbarque() {
  return (
    <AccessGuard allowedRoles={DATOS_EMBARQUE_ROLES}>
      <div>
        <p className="font-semibold text-2xl">Datos de Embarque</p>
        <EmbarqueProvider>
          <EmbarqueDataTable />
        </EmbarqueProvider>
      </div>
    </AccessGuard>
  );
}
