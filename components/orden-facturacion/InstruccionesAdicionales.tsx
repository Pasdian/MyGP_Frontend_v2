'use client';

import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
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
  AgregarInstruccionAdicional,
  ModificarInstruccionAdicional,
} from './AgregarInstruccionAdicional';

function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return '--';
  return Number.isInteger(value) ? String(value) : String(value);
}

export function InstruccionesAdicionales() {
  const { reference, referencePayload, isLoading, isReferenceSent } = useOrdenFacturacion();

  if (isLoading) return null;
  if (!reference || !referencePayload) return null;

  const instrucciones = referencePayload.INSTRUCCIONES_ADICIONALES || [];

  return (
    <OrdenFacturacionCard title="Instrucciones Adicionales">
      {!isReferenceSent ? (
        <div className="mb-4 flex gap-2">
          <AgregarInstruccionAdicional />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Creado Por</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instrucciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay instrucciones adicionales registradas.
                </TableCell>
              </TableRow>
            ) : (
              instrucciones.map((instruccion) => (
                <TableRow key={instruccion.UUID || `${instruccion.CONCEPTO}-${instruccion.CREATED_AT}`}>
                  <TableCell className="font-medium">{instruccion.CONCEPTO || '--'}</TableCell>
                  <TableCell className="text-right">{formatValue(instruccion.IMPORTE)}</TableCell>
                  <TableCell className="text-right">{formatValue(instruccion.CANTIDAD)}</TableCell>
                  <TableCell>{instruccion.CREATED_BY || '--'}</TableCell>
                  <TableCell>{instruccion.CREATED_AT_FMT || '--'}</TableCell>
                  <TableCell>{instruccion.UPDATED_AT_FMT || '--'}</TableCell>
                  <TableCell className="text-center">
                    {instruccion.UUID && !isReferenceSent ? (
                      <div className="flex justify-center">
                        <ModificarInstruccionAdicional item={instruccion} />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </OrdenFacturacionCard>
  );
}
