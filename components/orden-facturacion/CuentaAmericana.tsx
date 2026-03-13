'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GastoItem, useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { AgregarGasto } from './AgregarGasto';
import { AgregarProvision } from './AgregarProvision';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import React from 'react';
import { MyGPButtonDanger } from '../MyGPUI/Buttons/MyGPButtonDanger';
import { IconTrash } from '@tabler/icons-react';
import { TrashIcon } from 'lucide-react';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import useSWR from 'swr';
import { PERM } from '@/lib/modules/permissions';
import PermissionGuard from '../PermissionGuard/PermissionGuard';

export function CuentaAmericana() {
  const { reference, referencePayload, isLoading, swrKey } = useOrdenFacturacion();
  const { mutate } = useSWR(swrKey, axiosFetcher);
  const [isOpen, setIsOpen] = React.useState(false);

  if (isLoading) return null;
  if (!reference || !referencePayload) return null;

  const handleDeleteGasto = async (gasto: GastoItem) => {
    try {
      const payload = {
        referencia: reference,
        concepto: gasto.CVE_MOVI,
        factura: gasto.FOL_EROG,
        proveedor: gasto.CVE_BENE,
        importe: String(gasto.MON_EGRE),
        isAmericana: true,
      };

      await GPClient.delete('/dipp/deleteConcepto', { data: payload });
      await mutate();
      setIsOpen(false);
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting gasto:', error);
      toast.error('Error al borrar el gasto');
    }
  };

  return (
    <OrdenFacturacionCard title="Gastos A Comprobar">
      <div className="flex gap-2 mb-4">
        <AgregarGasto isAmericana={true} />
        <PermissionGuard
          requiredPermissions={[PERM.DIPP_SOLICITUDES_DIARIAS_RECURSOS_OPERATIVOS_ADMIN]}
        >
          <AgregarProvision isAmericana={true} />
        </PermissionGuard>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Importe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referencePayload?.CUENTA_AMERICANA?.map((gasto) => (
            <TableRow
              key={`${gasto.CVE_MOVI} ${gasto.FOL_EROG} ${gasto.MON_EGRE} ${gasto.CVE_BENE} ${gasto.canDelete}`}
            >
              <TableCell>
                {gasto.canDelete && (
                  <MyGPDialog
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    title="Eliminar Gasto"
                    description="Aquí podrás eliminar un gasto"
                    trigger={
                      <MyGPButtonDanger>
                        <IconTrash />
                      </MyGPButtonDanger>
                    }
                  >
                    <MyGPButtonDanger onClick={() => handleDeleteGasto(gasto)}>
                      <TrashIcon /> Confirmar
                    </MyGPButtonDanger>
                  </MyGPDialog>
                )}
              </TableCell>
              <TableCell>{gasto.CVE_MOVI}</TableCell>
              <TableCell>{gasto.FOL_EROG}</TableCell>
              <TableCell>{gasto.NOM_BENE}</TableCell>
              <TableCell>{gasto.MON_EGRE_FMT}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </OrdenFacturacionCard>
  );
}
