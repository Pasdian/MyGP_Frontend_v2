'use client';

import { useMemo } from 'react';
import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import Image from 'next/image';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { displayValue } from '@/lib/utilityFunctions/displayValue';

export function DatosReferencia() {
  const { reference, referencePayload, isLoading } = useOrdenFacturacion();

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
  const isKpiMet = referencePayload?.IS_KPI_MET;

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
            <Image
              src={isKpiMet ? `/images/verde.png` : `/images/rojo.png`}
              alt={`Semáforo KPI`}
              width={120}
              height={80}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <p className="font-semibold">Semaforo de Cruce:</p>

          <div
            className={`inline-flex h-8 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm
  ${
    semaforoCruce === 'VERDE'
      ? 'bg-green-700 ring-2 ring-green-500'
      : semaforoCruce === 'ROJO'
        ? 'bg-red-800 ring-2 ring-red-200'
        : 'bg-gray-500 ring-2 ring-gray-200'
  }`}
          >
            {semaforoCruce === 'VERDE'
              ? 'VERDE'
              : semaforoCruce === 'ROJO'
                ? 'ROJO'
                : 'DESCONOCIDO'}
          </div>

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
