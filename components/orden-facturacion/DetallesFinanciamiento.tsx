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
  const {
    anticipos,
    financiamiento,
    reference,
    referencePayload,
    isLoading,
    setAnticipos,
    setFinanciamiento,
  } = useOrdenFacturacion();

  if (isLoading) return null;

  if (!reference || !referencePayload) return null;

  return (
    <OrdenFacturacionCard title="Detalles de Financiamiento">
      <div className="mb-4">
        <DetallesFinanciamientoSelect
          label="Anticipos"
          options={anticiposOptions}
          value={anticipos}
          onValueChange={setAnticipos}
        />
      </div>
      <DetallesFinanciamientoSelect
        label="Financiamiento"
        options={financiamientoOptions}
        value={financiamiento}
        onValueChange={setFinanciamiento}
      />
    </OrdenFacturacionCard>
  );
}

function DetallesFinanciamientoSelect({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[100px_1fr]">
      <Label>{label} </Label>
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="w-full sm:w-64">
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
