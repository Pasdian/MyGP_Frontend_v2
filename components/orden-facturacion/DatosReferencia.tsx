'use client';

import { useMemo } from 'react';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import Image from 'next/image';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { displayValue } from '@/lib/utilityFunctions/displayValue';

function getKpiSemaphore(msa: string | null | undefined, horas: string | null | undefined) {
  if (!msa || !horas) return null;

  const horasNumber = Number(horas);
  if (Number.isNaN(horasNumber)) return null;

  const baseDate = new Date(msa);
  if (Number.isNaN(baseDate.getTime())) return null;

  const deadline = new Date(baseDate.getTime() + horasNumber * 60 * 60 * 1000);
  const now = new Date();

  return now <= deadline ? 'verde' : 'rojo';
}

export function DatosReferencia() {
  const { reference, referencePayload, isLoading } = useOrdenFacturacion();

  const kpiSemaphore = useMemo(() => {
    return getKpiSemaphore(referencePayload?.MSA_FMT, referencePayload?.HORAS);
  }, [referencePayload?.MSA_FMT, referencePayload?.HORAS]);

  if (isLoading) return null;

  if (!reference || !referencePayload) return null;

  const referenceValue = displayValue(reference);
  const tipoOperacion = displayValue(referencePayload?.IMP_EXPO);
  const cliente = displayValue(referencePayload?.CLIENTE);
  const proveedor = displayValue(referencePayload?.PROV);
  const guiaMaster = displayValue(referencePayload?.GUIA_M);
  const despachoMsa = displayValue(referencePayload?.MSA_FMT);
  const fechaEntrada = displayValue(referencePayload?.FEC_ENTR_FMT);
  const semaforoCruce = displayValue(referencePayload?.SEMAFORO);
  const aduana = displayValue(referencePayload?.ADU_NAME);
  const pedimento = displayValue(referencePayload?.NUM_PEDI);
  const ordenCompra = displayValue(referencePayload?.ORDEN_COMPRA_CLIENTE);
  const guiaHouse = displayValue(referencePayload?.GUIA_H);
  const impuestosPagados = displayValue(referencePayload?.TIPO_CUENTA);
  const clavePedimento = displayValue(referencePayload?.CVE_PEDI);
  const factura = displayValue(referencePayload?.NUM_FACTURA);

  return (
    <OrdenFacturacionCard title="Datos de la Referencia">
      <div className="grid grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <p className="font-semibold">Referencia</p>
          <p>{referenceValue}</p>

          <p className="font-semibold">Tipo de Operación:</p>
          <p>{tipoOperacion}</p>
          <p className="font-semibold">Cliente:</p>
          <p>{cliente}</p>
          <p className="font-semibold">Proveedor:</p>
          <p>{proveedor}</p>

          <p className="font-semibold">Guía Master / BL:</p>
          <p>{guiaMaster}</p>

          <p className="font-semibold">Despacho / MSA:</p>
          <p>{despachoMsa}</p>

          <p className="font-semibold">Fecha Entrada:</p>
          <p>{fechaEntrada}</p>

          <p className="font-semibold">Semáforo KPI:</p>
          <div>
            {kpiSemaphore ? (
              <Image
                src={`/images/${kpiSemaphore}.png`}
                alt={`Semáforo KPI ${kpiSemaphore}`}
                width={120}
                height={80}
              />
            ) : (
              <span>-</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <p className="font-semibold">Semaforo de Cruce:</p>
          <p className="flex items-center justify-center bg-green-700 font-semibold text-white">
            {semaforoCruce}
          </p>

          <p className="font-semibold">Aduana:</p>
          <p>{aduana}</p>

          <p className="font-semibold">Pedimento:</p>
          <p>{pedimento}</p>

          <p className="font-semibold">Orden de Compra:</p>
          <p>{ordenCompra}</p>
          <p className="font-semibold">Guia House:</p>
          <p>{guiaHouse}</p>

          <p className="font-semibold">Impuestos Pagados por:</p>
          <p>{impuestosPagados}</p>

          <p className="font-semibold">Clave de Pedimento:</p>
          <p>{clavePedimento}</p>

          <p className="font-semibold">Factura:</p>
          <p>{factura}</p>
        </div>
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-600">Cargando datos de referencia...</p>}
    </OrdenFacturacionCard>
  );
}
