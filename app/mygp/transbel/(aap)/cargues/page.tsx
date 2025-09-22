import AccessGuard from '@/components/AccessGuard/AccessGuard';
import { CarguesDataTable } from '@/components/datatables/transbel/CarguesDataTable';

export default function Cargues() {
  return (
    <AccessGuard
      allowedModules={['All Modules', 'Transbel Interfaz']}
      allowedRoles={['ADMIN', 'AAP']}
    >
      <CarguesDataTable />
    </AccessGuard>
  );
}
