'use client';

import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import React, { createContext, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

export type GastoItem = {
  CVE_MOVI: string | null;
  DES_EGRE: string | null;
  FOL_EROG: string | null;
  MON_EGRE: number | null;
  MON_EGRE_FMT: string | null;
  CVE_BENE: string | null;
  NOM_BENE: string | null;
  IS_AMERICANA: boolean;
  canDelete: boolean;
};

export type ExpedienteDigitalData = {
  HAS_FACTURA_ORIGEN: boolean;
  HAS_PEDIMENTO: boolean;
  HAS_MANIFESTACION_VALOR: boolean;
  HAS_CARTAS_COMERCIO_EXTERIOR: boolean;
};

export type InstruccionesAdicionalesData = {
  NUM_REFE: string | null;
  CAPTURA_FACTURA_COVE: number | null;
  CAPTURA_FACTURA_COVE_MONTO: number | null;
  EXTRAORDINARIO_AA: number | null;
  EXTRAORDINARIO_AA_MONTO: number | null;
  CANDADOS_FISCALES: number | null;
  CANDADOS_FISC_MONTO: number | null;
  CANDADOS_FISC_CANT: number | null;
  FIRMA_DIGITAL: number | null;
};

export type GastoAmericanoItem = {
  CVE_MOVI: string | null;
  DES_EGRE: string | null;
  FOL_EROG: string | null;
  MON_EGRE: number | null;
  MON_EGRE_FMT: string | null;
  CVE_BENE: string | null;
  NOM_BENE: string | null;
  IS_AMERICANA: boolean;
};

export type DippReferenceData = {
  IMP_EXPO: string | null;
  CLIENTE: string | null;
  NUM_PEDI: string | null;
  PROV: string | null;
  ANTI: number | null;
  SALDO: number | null;
  MSA: string | null;
  ADU: string | null;
  GUIA_M: string | null;
  GUIA_H: string | null;
  NUM_LINEAS_COVE: number | null;
  SEMAFORO: string | null;
  TIPO_CUENTA: number;
  REG_ADUA: string | null;
  CVE_PEDI: string | null;
  ORDEN_COMPRA_CLIENTE: string | null;
  DIA_PAGO: string | null;
  NUM_CANDADOS: number | null;
  FEC_ENTR: string | null;
  NUM_FACTURA: string | null;
  ADU_NAME: string | null;
  ADU_CODE: string | null;
  MSA_FMT: string | null;
  DIA_PAGO_FMT: string | null;
  FEC_ENTR_FMT: string | null;
  ID_ORDEN: string | null;
  FECHA_ESTATUS: string | null;
  FECHA_ESTATUS_FMT: string | null;
  ESTATUS: string | null;
  NOMBRE: string | null;
  PATERNO: string | null;
  MATERNO: string | null;
  HORAS: string | null;
  CVE_IMP: string | null;
  GASTOS_A_COMPROBAR: GastoItem[];
  CUENTA_AMERICANA: GastoItem[];
  INSTRUCCIONES_ADICIONALES: InstruccionesAdicionalesData | null;
  EXPEDIENTE_DIGITAL: ExpedienteDigitalData | null;

  PROVISION: {
    CVE_IMPO: string | null;
    IMP_EXPO: string | null;
    NOM_IMP: string | null;
    NUM_REFE: string | null;
  }[];
};

type OrdenFacturacionContextType = {
  reference: string;
  setReference: React.Dispatch<React.SetStateAction<string>>;
  referencePayload: DippReferenceData | null;
  isLoading: boolean;
  error: Error | null;
  swrKey: string | null;
};

const OrdenFacturacionContext = createContext<OrdenFacturacionContextType | undefined>(undefined);

export function OrdenFacturacionProvider({ children }: { children: React.ReactNode }) {
  const [reference, setReference] = useState('');

  const normalizedReference = reference.trim().toUpperCase();
  const swrKey = normalizedReference
    ? `/dipp/referenceData?reference=${encodeURIComponent(normalizedReference)}`
    : null;

  const { data, isLoading, error } = useSWR<DippReferenceData>(swrKey, axiosFetcher);

  const referencePayload = useMemo(() => {
    if (!data) return null;
    return data;
  }, [data]);

  const value = useMemo(
    () => ({
      reference,
      setReference,
      referencePayload,
      isLoading,
      error: (error as Error | undefined) ?? null,
      swrKey,
    }),
    [referencePayload, error, isLoading, reference, swrKey]
  );

  return (
    <OrdenFacturacionContext.Provider value={value}>{children}</OrdenFacturacionContext.Provider>
  );
}

export function useOrdenFacturacion() {
  const context = useContext(OrdenFacturacionContext);

  if (!context) {
    throw new Error('useOrdenFacturacion must be used within an OrdenFacturacionProvider');
  }

  return context;
}
