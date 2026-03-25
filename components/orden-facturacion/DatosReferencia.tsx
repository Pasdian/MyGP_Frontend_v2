'use client';

import { useOrdenFacturacion } from '@/contexts/dipp/OrdenFacturacionContext';
import { OrdenFacturacionCard } from './OrdenFacturacionCard';
import { displayValue } from '@/lib/utilityFunctions/displayValue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const hasDespachoMsa = despachoMsa !== '--';
  const fechaEntrada = displayValue(referencePayload?.FEC_ENTR_FMT);
  const semaforoCruce = displayValue(referencePayload?.SEMAFORO);
  const aduana = displayValue(referencePayload?.ADU_NAME);
  const pedimento = displayValue(referencePayload?.NUM_PEDI);
  const ordenCompra = displayValue(referencePayload?.ORDEN_COMPRA_CLIENTE);
  const guiaHouse = displayValue(referencePayload?.GUIA_H);
  const impuestosPagados = displayValue(referencePayload?.TIPO_CUENTA);
  const clavePedimento = displayValue(referencePayload?.CVE_PEDI);
  const factura = displayValue(referencePayload?.NUM_FACTURA);
  const estado = displayValue(referencePayload?.REFERENCIA_GUARDADA?.STATUS);
  const hasEstado = estado !== '--';
  const isKpiMet = referencePayload?.IS_KPI_MET;
  const kpiDaysDiff = referencePayload?.KPI_DAYS_DIFF;
  const kpiBadgeLabel =
    typeof kpiDaysDiff === 'number'
      ? `${kpiDaysDiff} día${kpiDaysDiff === 1 ? '' : 's'}`
      : 'SIN KPI';

  const kpiTooltipText =
    typeof kpiDaysDiff === 'number'
      ? `${kpiBadgeLabel} de retraso para tipo de tráfico ${referencePayload.TRAFFIC_TYPE}`
      : 'Sin información de KPI';

  return (
    <OrdenFacturacionCard title="Datos de la Referencia">
      <div className="grid grid-cols-4 gap-4 items-center">
        <p className="font-semibold">Estado</p>
        <div
          className={`inline-flex h-8 w-fit items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm ${
            hasEstado ? 'bg-green-700 ring-2 ring-green-500' : 'bg-gray-500 ring-2 ring-gray-200'
          }`}
        >
          {estado}
        </div>

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

        <p className="font-semibold">Referencia</p>
        <p>{referenceValue}</p>

        <p className="font-semibold">Aduana:</p>
        <p>{aduana}</p>

        <p className="font-semibold">Tipo de Operación:</p>
        <p>{tipoOperacion}</p>

        <p className="font-semibold">Pedimento:</p>
        <p>{pedimento}</p>

        <p className="font-semibold">Cliente:</p>
        <p>{cliente}</p>

        <p className="font-semibold">Orden de Compra:</p>
        <p>{ordenCompra}</p>

        <p className="font-semibold">Proveedor:</p>
        <p>{proveedor}</p>

        <p className="font-semibold">Guia House:</p>
        <p>{guiaHouse}</p>

        <p className="font-semibold">Guía Master / BL:</p>
        <p>{guiaMaster}</p>

        <p className="font-semibold">Impuestos Pagados por:</p>
        <p>{impuestosPagados}</p>

        <p className="font-semibold">Fecha Entrada:</p>
        <p>{fechaEntrada}</p>

        <p className="font-semibold">Clave de Pedimento:</p>
        <p>{clavePedimento}</p>

        <p className="font-semibold">Despacho / MSA:</p>
        <div
          className={`inline-flex h-8 w-fit items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm ${
            hasDespachoMsa
              ? 'bg-green-700 ring-2 ring-green-500'
              : 'bg-gray-500 ring-2 ring-gray-200'
          }`}
        >
          {despachoMsa}
        </div>

        <p className="font-semibold">Factura:</p>
        <p>{factura}</p>

        <p className="font-semibold">Semáforo KPI:</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`inline-flex w-fit items-center justify-center rounded-full px-2 py-0.5 font-medium text-white shadow-sm cursor-pointer text-sm
                ${
                  typeof kpiDaysDiff !== 'number'
                    ? 'bg-gray-500 ring-1 ring-gray-200'
                    : isKpiMet
                      ? 'bg-green-700 ring-1 ring-green-500'
                      : 'bg-red-800 ring-1 ring-red-200'
                }`}
              >
                {referencePayload.SENT_AT_FMT || '--'}
              </div>
            </TooltipTrigger>

            <TooltipContent>{kpiTooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isLoading && <p className="mt-4 text-sm text-slate-600">Cargando datos de referencia...</p>}
    </OrdenFacturacionCard>
  );
}
