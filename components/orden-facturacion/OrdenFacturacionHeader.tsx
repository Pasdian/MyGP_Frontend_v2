'use client';
import { Input } from '@/components/ui/input';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import { FormEvent, useState } from 'react';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import MyGPButtonSubmit from '../MyGPUI/Buttons/MyGPButtonSubmit';

export function OrdenFacturacionHeader() {
  const { reference, setReference, isLoading, error } = useOrdenFacturacion();
  const [referenceInput, setReferenceInput] = useState(reference);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReference(referenceInput.trim().toUpperCase());
  }

  return (
    <OrdenFacturacionCard title="Orden de Facturación">
      <form className="mb-4 flex items-end gap-2" onSubmit={onSubmit}>
        <div className="w-[260px]">
          <p className="mb-1 text-sm font-semibold">Referencia</p>
          <Input
            value={referenceInput}
            onChange={(e) => setReferenceInput(e.target.value)}
            placeholder="Ej. PFI12455"
          />
        </div>
        <MyGPButtonSubmit isSubmitting={isLoading} isSubmittingText="Buscando...">
          Buscar
        </MyGPButtonSubmit>
      </form>

      {error ? <p className="mt-2 text-sm text-red-600">No se pudo cargar la referencia.</p> : null}
    </OrdenFacturacionCard>
  );
}
