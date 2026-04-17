'use client';

import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

export type GastoItem = {
  CVE_MOVI: string | null;
  DES_EGRE: string | null;
  FOL_EROG: string | null;
  MON_EGRE: number | string | null;
  MON_EGRE_FMT: string | null;
  CVE_BENE: string | null;
  NOM_BENE: string | null;
  IS_AMERICANA: boolean;
  CHECKED: boolean | null;
  canDelete: boolean;
};

export type ExpedienteDigitalData = {
  HAS_FACTURA_ORIGEN: {
    found: boolean;
    filename: string | null;
    filenames: string[];
    skipped?: boolean;
  };
  HAS_PEDIMENTO: {
    found: boolean;
    filename: string | null;
    filenames: string[];
    skipped?: boolean;
  };
  HAS_MANIFESTACION_VALOR: {
    found: boolean;
    filename: string | null;
    filenames: string[];
    skipped?: boolean;
  };
  HAS_CARTAS_COMERCIO_EXTERIOR: {
    found: boolean;
    filename: string | null;
    filenames: string[];
    skipped?: boolean;
  };
  HAS_GUIA: {
    found: boolean;
    filename: string | null;
    filenames: string[];
    skipped?: boolean;
  };
};

export type InstruccionAdicionalItem = {
  UUID: string | null;
  NUM_REFE: string | null;
  CONCEPTO: string | null;
  IMPORTE: number | null;
  CANTIDAD: number | null;
  CREATED_BY: string | null;
  CREATED_AT: string | null;
  CREATED_AT_FMT?: string | null;
  UPDATED_AT: string | null;
  UPDATED_AT_FMT?: string | null;
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
  SENT_AT: string | null;
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
  SENT_AT_FMT: string | null;
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
  IS_KPI_MET: boolean | null;
  KPI_DAYS_DIFF: string | null;
  TRAFFIC_TYPE: string | null;
  REFERENCIA_GUARDADA: {
    REFERENCIA: string | null;
    OBSERVACIONES: string | null;
    STATUS: string | null;
    ANTICIPOS: string | null;
    FINANCIAMIENTO: string | null;
    WAS_GASTOS_CONFIRMED: number | null;
    WAS_GASTOS_AMERICANA_CONFIRMED: number | null;
    SUBMITTED_BY: string | null;
    CREATED_AT: string | null;
    SENT_AT: string | null;
  } | null;
  INSTRUCCIONES_ADICIONALES: InstruccionAdicionalItem[];
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
  isReferenceSent: boolean;
  anticipos: string;
  setAnticipos: React.Dispatch<React.SetStateAction<string>>;
  financiamiento: string;
  setFinanciamiento: React.Dispatch<React.SetStateAction<string>>;
  wasGastosConfirmed: boolean;
  setWasGastosConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  wasGastosAmericanaConfirmed: boolean;
  setWasGastosAmericanaConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  error: Error | null;
  swrKey: string | null;
  refreshReference: () => Promise<DippReferenceData | undefined>;
};

const OrdenFacturacionContext = createContext<OrdenFacturacionContextType | undefined>(undefined);

export function OrdenFacturacionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reference, setReferenceState] = useState(() => searchParams.get('ref') ?? '');
  const [anticipos, setAnticipos] = useState('');
  const [financiamiento, setFinanciamiento] = useState('');
  const [wasGastosConfirmed, setWasGastosConfirmed] = useState(false);
  const [wasGastosAmericanaConfirmed, setWasGastosAmericanaConfirmed] = useState(false);

  const setReference = useCallback(
    (value: React.SetStateAction<string>) => {
      const next = typeof value === 'function' ? value(reference) : value;
      setReferenceState(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set('ref', next);
      } else {
        params.delete('ref');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [reference, router, searchParams],
  );

  const normalizedReference = reference.trim().toUpperCase();
  const swrKey = normalizedReference
    ? `/pyapi/dipp/referenceData?reference=${encodeURIComponent(normalizedReference)}`
    : null;

  const { data, isLoading, error, mutate } = useSWR<DippReferenceData>(swrKey, axiosFetcher);

  const referencePayload = useMemo(() => {
    if (!data) return null;
    return data;
  }, [data]);

  const isReferenceSent = useMemo(() => {
    const status = referencePayload?.REFERENCIA_GUARDADA?.STATUS;
    return typeof status === 'string' && status.trim().toUpperCase() === 'ENVIADA';
  }, [referencePayload?.REFERENCIA_GUARDADA?.STATUS]);

  const savedReference = referencePayload?.REFERENCIA_GUARDADA;
  const loadedReference = referencePayload?.PROVISION?.[0]?.NUM_REFE ?? savedReference?.REFERENCIA;

  useEffect(() => {
    setAnticipos(savedReference?.ANTICIPOS || '');
    setFinanciamiento(savedReference?.FINANCIAMIENTO || '');
    setWasGastosConfirmed(savedReference?.WAS_GASTOS_CONFIRMED === 1);
    setWasGastosAmericanaConfirmed(savedReference?.WAS_GASTOS_AMERICANA_CONFIRMED === 1);
  }, [
    loadedReference,
    savedReference?.ANTICIPOS,
    savedReference?.FINANCIAMIENTO,
    savedReference?.WAS_GASTOS_CONFIRMED,
    savedReference?.WAS_GASTOS_AMERICANA_CONFIRMED,
  ]);

  const value = useMemo(
    () => ({
      reference,
      setReference,
      referencePayload,
      isReferenceSent,
      anticipos,
      setAnticipos,
      financiamiento,
      setFinanciamiento,
      wasGastosConfirmed,
      setWasGastosConfirmed,
      wasGastosAmericanaConfirmed,
      setWasGastosAmericanaConfirmed,
      isLoading,
      error: (error as Error | undefined) ?? null,
      swrKey,
      refreshReference: () => mutate(),
    }),
    [
      anticipos,
      error,
      financiamiento,
      isLoading,
      isReferenceSent,
      mutate,
      reference,
      referencePayload,
      setReference,
      swrKey,
      wasGastosAmericanaConfirmed,
      wasGastosConfirmed,
    ]
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
