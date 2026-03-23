'use client';

import { OrdenFacturacionHeader } from '@/components/orden-facturacion/OrdenFacturacionHeader';
import { DatosReferencia } from '@/components/orden-facturacion/DatosReferencia';
import { DetallesFinanciamiento } from '@/components/orden-facturacion/DetallesFinanciamiento';
import { GastosAComprobar } from '@/components/orden-facturacion/GastosAComprobar';
import { OrdenFacturacionProvider } from '@/contexts/dipp/OrdenFacturacionContext';
import { InstruccionesAdicionales } from '@/components/orden-facturacion/InstruccionesAdicionales';
import { ExpedienteDigitalChecklist } from '@/components/orden-facturacion/ExpedienteDigitalChecklist';
import { OrdenFacturacionCard } from '@/components/orden-facturacion/OrdenFacturacionCard';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const STATUS_OPTIONS = [
  { value: 'CAPTURADA', label: 'Capturada' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'REVISADA', label: 'Revisada' },
  { value: 'CERRADA', label: 'Cerrada' },
] as const;

export default function OrdenFacturacion() {
  return (
    <OrdenFacturacionProvider>
      <div>
        <div className="mb-4">
          <OrdenFacturacionHeader />
        </div>
        <div className="mb-4">
          <DatosReferencia />
        </div>
        <div className="mb-4">
          <DetallesFinanciamiento />
        </div>
        <div className="mb-4">
          <GastosAComprobar />
        </div>
        <div className="mb-4">
          <GastosAComprobar isAmericana />
        </div>
        <div className="mb-4">
          <InstruccionesAdicionales />
        </div>
        <div>
          <ExpedienteDigitalChecklist />
        </div>
        <div className="mt-4">
          <GuardarReferenciaSection />
        </div>
      </div>
    </OrdenFacturacionProvider>
  );
}

function GuardarReferenciaSection() {
  const {
    anticipos,
    financiamiento,
    reference,
    referencePayload,
    isLoading,
    wasGastosAmericanaConfirmed,
    wasGastosConfirmed,
  } = useOrdenFacturacion();
  const { getCasaUsername, getUserEmail, getUserFullName } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [observaciones, setObservaciones] = React.useState('');
  const [estatus, setEstatus] = React.useState<(typeof STATUS_OPTIONS)[number]['value']>('CAPTURADA');

  React.useEffect(() => {
    const savedReference = referencePayload?.REFERENCIA_GUARDADA;

    setObservaciones(savedReference?.OBSERVACIONES || '');
    setEstatus(
      (savedReference?.STATUS as (typeof STATUS_OPTIONS)[number]['value'] | null) || 'CAPTURADA'
    );
  }, [referencePayload]);

  if (isLoading) return null;

  if (!reference || !referencePayload) return null;

  async function onSubmit() {
    if (!anticipos) {
      toast.error('Debes seleccionar Anticipos antes de guardar la referencia');
      return;
    }

    if (!financiamiento) {
      toast.error('Debes seleccionar Financiamiento antes de guardar la referencia');
      return;
    }

    if (!wasGastosConfirmed) {
      toast.error('Debes confirmar los gastos a comprobar antes de guardar la referencia');
      return;
    }

    if (referencePayload?.TRAFFIC_TYPE === 'L' && !wasGastosAmericanaConfirmed) {
      toast.error('Debes confirmar los gastos de cuenta americana antes de guardar la referencia');
      return;
    }

    try {
      setIsSubmitting(true);

      await GPClient.post('/pyapi/dipp/saveReference', {
        referencia: reference,
        observaciones: observaciones.trim() || null,
        estatus,
        anticipos,
        financiamiento,
        submittedBy: getCasaUsername() || 'MYGP',
        userEmail: getUserEmail() || '',
        userFullName: getUserFullName() || getCasaUsername() || 'MYGP',
        wasGastosConfirmed,
        wasGastosAmericanaConfirmed:
          referencePayload?.TRAFFIC_TYPE === 'L' ? wasGastosAmericanaConfirmed : null,
      });

      toast.success('Referencia guardada correctamente');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || error.response?.data?.message || error.message);
      } else {
        toast.error('Ocurrió un error al guardar la referencia');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OrdenFacturacionCard title="Guardar Referencia">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="observaciones">OBSERVACIONES</Label>
          <Textarea
            id="observaciones"
            placeholder="Agrega observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estatus">ESTATUS</Label>
          <Select value={estatus} onValueChange={(value) => setEstatus(value as (typeof STATUS_OPTIONS)[number]['value'])}>
            <SelectTrigger id="estatus" className="w-full">
              <SelectValue placeholder="Selecciona un estatus" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <MyGPButtonSubmit isSubmitting={isSubmitting} onClick={onSubmit}>
          Guardar Referencia
        </MyGPButtonSubmit>
      </div>
    </OrdenFacturacionCard>
  );
}
