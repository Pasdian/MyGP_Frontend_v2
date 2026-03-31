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
import GestorUploadFileDialog from '@/components/gestor/GestorUploadFileDialog';

const CHECKLIST_ITEMS = [
  { key: 'HAS_FACTURA_ORIGEN', label: 'Factura Origen' },
  { key: 'HAS_PEDIMENTO', label: 'Pedimento' },
  {
    key: 'HAS_MANIFESTACION_VALOR',
    label: 'Manifestación de Valor',
  },
  { key: 'HAS_CARTAS_COMERCIO_EXTERIOR', label: 'Cartas de Comercio Exterior' },
] as const;

const GESTOR_CATEGORY_BY_CHECKLIST_ITEM: Partial<
  Record<(typeof CHECKLIST_ITEMS)[number]['key'], string>
> = {
  HAS_FACTURA_ORIGEN: 'FAC_COM',
  HAS_PEDIMENTO: 'PED_NOR',
  HAS_MANIFESTACION_VALOR: 'MAN_VAL',
};

export function ExpedienteDigitalChecklist() {
  const { referencePayload, isLoading, refreshReference } = useOrdenFacturacion();

  if (isLoading || !referencePayload) return null;

  const expediente = referencePayload.EXPEDIENTE_DIGITAL ?? ({} as ExpedienteDigitalData);
  const provision = referencePayload.PROVISION?.[0];
  const gestorClient = provision?.CVE_IMPO || referencePayload.CVE_IMP || '';
  const gestorReference = provision?.NUM_REFE || '';

  const handleUploadSuccess = () => {
    void refreshReference();

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        void refreshReference();
      }, 1200);

      window.setTimeout(() => {
        void refreshReference();
      }, 3000);
    }
  };

  return (
    <OrdenFacturacionCard title="Expediente Digital">
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-24">Gestor</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="text-center">Estatus</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {CHECKLIST_ITEMS.map(({ key, label }) => {
              const found = Boolean(expediente[key]?.found);
              const defaultFileCategory = GESTOR_CATEGORY_BY_CHECKLIST_ITEM[key];
              return (
                <TableRow key={key}>
                  <TableCell className="text-left">
                    {gestorClient && gestorReference && defaultFileCategory ? (
                      <GestorUploadFileDialog
                        client={gestorClient}
                        reference={gestorReference}
                        defaultFileCategory={defaultFileCategory}
                        triggerLabel="Subir Archivo"
                        triggerClassName="h-8 px-3"
                        disableCategorySelect={true}
                        onUploadSuccess={handleUploadSuccess}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm ">
                    <p className="font-medium">{label}</p>
                    {expediente[key]?.filenames.map((filename) => {
                      return <p key={filename}>{filename}</p>;
                    })}
                  </TableCell>
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
      </div>
    </OrdenFacturacionCard>
  );
}
