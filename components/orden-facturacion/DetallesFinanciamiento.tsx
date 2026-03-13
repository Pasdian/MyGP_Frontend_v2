'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { Label } from '../ui/label';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';

const anticiposOptions = [
  {
    value: 'IMPUESTOS',
    label: 'Impuestos',
  },
  {
    value: 'GASTOS',
    label: 'Gastos',
  },
  {
    value: 'ANTICIPOS_TOTAL',
    label: 'Anticipos Total',
  },
];

const financiamientoOptions = [
  {
    value: 'IMPUESTOS',
    label: 'Impuestos',
  },
  {
    value: 'GASTOS',
    label: 'Gastos',
  },
  {
    value: 'FINANCIAMIENTO_TOTAL',
    label: 'Financiamiento Total',
  },
];

export function DetallesFinanciamiento() {
  const { reference, referencePayload, isLoading } = useOrdenFacturacion();

  if (isLoading) return null;

  if (!reference || !referencePayload) return null;

  return (
    <OrdenFacturacionCard title="Detalles de Financiamiento">
      <div className="mb-4">
        <DetallesFinanciamientoSelect label="Anticipos" options={anticiposOptions} />
      </div>
      <DetallesFinanciamientoSelect label="Financiamiento" options={financiamientoOptions} />
    </OrdenFacturacionCard>
  );
}

function DetallesFinanciamientoSelect({
  label,
  options,
}: {
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2">
      <Label>{label} </Label>
      <Select>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecciona una opción" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => {
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
