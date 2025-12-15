'use client';

import DeliveriesDataTable from '@/components/datatables/transbel/DeliveriesDataTable';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';
import { useDeliveries } from '@/hooks/useDeliveries';
import { PERM } from '@/lib/modules/permissions';

export default function Deliveries() {
  const { deliveries, setDeliveries, isLoading } = useDeliveries();
  return (
    <PermissionGuard requiredPermissions={[PERM.TRANSBEL_ENTREGAS]}>
      <h1 className="text-2xl font-bold tracking-tight mb-4">Entregas a CDP / CPAC</h1>
      <DeliveriesContext.Provider value={{ deliveries, setDeliveries, isLoading }}>
        <DeliveriesDataTable />
      </DeliveriesContext.Provider>
    </PermissionGuard>
  );
}
