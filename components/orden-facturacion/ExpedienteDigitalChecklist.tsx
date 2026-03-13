'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import {
  ExpedienteDigitalData,
  useOrdenFacturacion,
} from '@/contexts/dipp/OrdenFacturacionContext';

const CHECKLIST_ITEMS = [
  { key: 'HAS_FACTURA_ORIGEN', label: 'Factura Origen' },
  { key: 'HAS_PEDIMENTO', label: 'Pedimento' },
  {
    key: 'HAS_MANIFESTACION_VALOR',
    label: 'Manifestación de Valor',
  },
  { key: 'HAS_CARTAS_COMERCIO_EXTERIOR', label: 'Cartas de Comercio Exterior' },
] as const;

export function ExpedienteDigitalChecklist() {
  const { referencePayload, isLoading } = useOrdenFacturacion();

  if (isLoading || !referencePayload) return null;

  const expediente = referencePayload.EXPEDIENTE_DIGITAL ?? ({} as ExpedienteDigitalData);

  return (
    <OrdenFacturacionCard title="Expediente Digital">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead className="text-center w-24">Estatus</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {CHECKLIST_ITEMS.map(({ key, label }) => {
            const found = Boolean(expediente[key]);
            return (
              <TableRow key={key}>
                <TableCell className="text-sm font-medium">{label}</TableCell>
                <TableCell className="text-center">
                  {found ? (
                    <CheckCircle2 className="inline-block text-emerald-500" size={18} />
                  ) : (
                    <XCircle className="inline-block text-rose-500" size={18} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </OrdenFacturacionCard>
  );
}
