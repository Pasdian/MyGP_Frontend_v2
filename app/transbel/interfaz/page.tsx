import { GPClient } from '@/axios-instance';
import DataTableInterfaz from '@/components/data-table-interfaz';
import GPLayout from '@/components/gp-layout';

export default async function Interfaz() {
  return (
    <GPLayout>
      <DataTableInterfaz />
    </GPLayout>
  );
}
