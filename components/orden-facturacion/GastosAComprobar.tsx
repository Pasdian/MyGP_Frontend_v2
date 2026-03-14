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
import { Loader2, TrashIcon } from 'lucide-react';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import useSWR from 'swr';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

interface GastosAComprobarProps {
  isAmericana?: boolean;
}

export function GastosAComprobar({ isAmericana = false }: GastosAComprobarProps) {
  const { getUserEmail, getUserFullName } = useAuth();
  const [loadingCheckbox, setLoadingCheckbox] = React.useState<string | null>(null);

  const { reference, referencePayload, isLoading, swrKey } = useOrdenFacturacion();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { mutate } = useSWR(swrKey, axiosFetcher);
  const [isOpen, setIsOpen] = React.useState(false);

  if (isLoading) return null;
  if (!reference || !referencePayload) return null;
  if (isAmericana && referencePayload.TRAFFIC_TYPE !== 'L') return null;

  const gastos = isAmericana
    ? referencePayload.CUENTA_AMERICANA
    : referencePayload.GASTOS_A_COMPROBAR;

  const title = isAmericana ? 'Gastos A Comprobar - Cuenta Americana' : 'Gastos A Comprobar';

  const handleDeleteGasto = async (gasto: GastoItem) => {
    try {
      setIsSubmitting(true);
      const payload = {
        referencia: reference,
        concepto: gasto.CVE_MOVI,
        factura: gasto.FOL_EROG,
        clave_proveedor: gasto.CVE_BENE,
        importe: String(gasto.MON_EGRE),
        isAmericana,
        proveedor_name: gasto.NOM_BENE,
        concepto_name: gasto.DES_EGRE,
        userEmail: getUserEmail() || '',
        userFullName: getUserFullName() || '',
      };

      await GPClient.delete('/dipp/deleteGasto', { data: payload });
      await mutate();
      setIsOpen(false);
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting gasto:', error);
      toast.error('Error al borrar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleChecked = async (gasto: GastoItem, checked: boolean) => {
    const key = `${gasto.CVE_MOVI}-${gasto.FOL_EROG}-${gasto.CVE_BENE}`;
    try {
      setLoadingCheckbox(key);
      await GPClient.patch('/dipp/updateGastoChecked', {
        referencia: reference,
        concepto: gasto.CVE_MOVI,
        factura: gasto.FOL_EROG,
        clave_proveedor: gasto.CVE_BENE,
        importe: String(gasto.MON_EGRE),
        checked,
        canDelete: gasto.canDelete,
      });
      await mutate();
      toast.success('Se verificó el gasto');
    } catch (error) {
      console.error('Error updating checked:', error);
      toast.error('Error al actualizar el gasto');
    } finally {
      setLoadingCheckbox(null);
    }
  };

  return (
    <OrdenFacturacionCard title={title}>
      <div className="flex gap-2 mb-4">
        <AgregarGasto isAmericana={isAmericana} />
        <PermissionGuard requiredPermissions={[PERM.DIPP_ORDEN_FACTURACION_ADMIN]}>
          <AgregarProvision isAmericana={isAmericana} />
        </PermissionGuard>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Verificar</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Factura</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Importe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos?.map((gasto) => (
            <TableRow
              key={`${gasto.CVE_MOVI} ${gasto.FOL_EROG} ${gasto.MON_EGRE} ${gasto.CVE_BENE} ${gasto.canDelete} ${gasto.CHECKED}`}
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
                    <MyGPButtonSubmit
                      onClick={() => handleDeleteGasto(gasto)}
                      danger={true}
                      isSubmitting={isSubmitting}
                    >
                      <TrashIcon /> Confirmar
                    </MyGPButtonSubmit>
                  </MyGPDialog>
                )}
              </TableCell>
              <TableCell>
                {(() => {
                  const key = `${gasto.CVE_MOVI}-${gasto.FOL_EROG}-${gasto.CVE_BENE}`;
                  const isRowLoading = loadingCheckbox === key;
                  console.log(gasto);
                  return isRowLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Checkbox
                      key={`checkbox-${gasto.CVE_MOVI}-${gasto.FOL_EROG}-${gasto.CVE_BENE}-${gasto.CHECKED}`}
                      checked={gasto.CHECKED === true}
                      onCheckedChange={(checked) => handleToggleChecked(gasto, checked as boolean)}
                      className="border-slate-400 bg-white data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  );
                })()}
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
