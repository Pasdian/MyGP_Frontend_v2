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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import React, { Suspense } from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { SaveAllIcon, SendIcon } from 'lucide-react';

export default function OrdenFacturacion() {
  return (
    <Suspense>
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
    </Suspense>
  );
}

function GuardarReferenciaSection() {
  const {
    anticipos,
    financiamiento,
    isReferenceSent,
    reference,
    referencePayload,
    isLoading,
    refreshReference,
    wasGastosAmericanaConfirmed,
    wasGastosConfirmed,
  } = useOrdenFacturacion();
  const { getCasaUsername, getUserEmail, getUserFullName } = useAuth();
  const [submitMode, setSubmitMode] = React.useState<'save' | 'send' | null>(null);
  const [observaciones, setObservaciones] = React.useState('');
  const savedReference = referencePayload?.REFERENCIA_GUARDADA;
  const loadedReference = referencePayload?.PROVISION?.[0]?.NUM_REFE ?? savedReference?.REFERENCIA;

  React.useEffect(() => {
    setObservaciones(savedReference?.OBSERVACIONES || '');
  }, [loadedReference, savedReference?.OBSERVACIONES]);

  if (isLoading) return null;

  if (!reference || !referencePayload) return null;

  const EXPEDIENTE_DIGITAL_LABELS: Record<string, string> = {
    HAS_FACTURA_ORIGEN: 'Factura Origen',
    HAS_PEDIMENTO: 'Pedimento',
    HAS_MANIFESTACION_VALOR: 'Manifestación de Valor',
    HAS_CARTAS_COMERCIO_EXTERIOR: 'Cartas de Comercio Exterior',
    HAS_GUIA: 'Guía / BL',
  };

  const missingExpedienteItems =
    referencePayload.EXPEDIENTE_DIGITAL === null
      ? Object.values(EXPEDIENTE_DIGITAL_LABELS)
      : Object.entries(referencePayload.EXPEDIENTE_DIGITAL)
          .filter(([, file]) => !file.skipped && !file.found)
          .map(([key]) => EXPEDIENTE_DIGITAL_LABELS[key] ?? key);

  const isExpedienteDigitalComplete = missingExpedienteItems.length === 0;
  const sendDisabledReason =
    missingExpedienteItems.length > 0
      ? `Faltan documentos en el expediente digital: ${missingExpedienteItems.join(', ')}.`
      : null;

  async function onSubmit(mode: 'save' | 'send') {
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

    if (mode === 'send' && sendDisabledReason) {
      toast.error(sendDisabledReason);
      return;
    }

    try {
      setSubmitMode(mode);

      await GPClient.post('/pyapi/dipp/saveReference', {
        referencia: reference,
        observaciones: observaciones.trim() || null,
        sendReference: mode === 'send',
        anticipos,
        financiamiento,
        submittedBy: getCasaUsername() || 'MYGP',
        userEmail: getUserEmail() || '',
        userFullName: getUserFullName() || getCasaUsername() || 'MYGP',
        wasGastosConfirmed,
        wasGastosAmericanaConfirmed:
          referencePayload?.TRAFFIC_TYPE === 'L' ? wasGastosAmericanaConfirmed : null,
      });
      await refreshReference();

      toast.success(
        mode === 'send' ? 'Referencia enviada correctamente' : 'Referencia guardada correctamente'
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || error.response?.data?.message || error.message);
      } else {
        toast.error(
          mode === 'send'
            ? 'Ocurrió un error al enviar la referencia'
            : 'Ocurrió un error al guardar la referencia'
        );
      }
    } finally {
      setSubmitMode(null);
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
            readOnly={isReferenceSent}
          />
        </div>
        {!isReferenceSent ? (
          <div className="flex flex-wrap gap-8">
            <MyGPButtonSubmit
              isSubmitting={submitMode === 'save'}
              isSubmittingText="Guardando..."
              disabled={submitMode !== null}
              onClick={() => onSubmit('save')}
            >
              <SaveAllIcon /> Guardar Referencia
            </MyGPButtonSubmit>
            {!sendDisabledReason ? (
              <MyGPButtonSubmit
                isSubmitting={submitMode === 'send'}
                isSubmittingText="Enviando..."
                disabled={submitMode !== null}
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onSubmit('send')}
              >
                <SendIcon /> Enviar Referencia
              </MyGPButtonSubmit>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <MyGPButtonSubmit
                      isSubmitting={submitMode === 'send'}
                      isSubmittingText="Enviando..."
                      disabled={true}
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onSubmit('send')}
                    >
                      <SendIcon /> Enviar Referencia
                    </MyGPButtonSubmit>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {sendDisabledReason}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ) : null}
      </div>
    </OrdenFacturacionCard>
  );
}
