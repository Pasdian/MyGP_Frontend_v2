export type SolicitudDiariaRow = {
  ID_SOLICITUD: number;
  CLIENT: string;
  TIPO_REFERENCIA: string;
  TIPO_PAGO: string;
  TIPO: string;
  CONCEPTO: string;
  NUMERO_REFERENCIA: string;
  INGRESO_ESTIMADO: number;
  INGRESO_REAL: number | null;
  DIFERENCIA: number | null;
  HAS_ANTICIPO: boolean;
  OBSERVACIONES: string | null;
  CREATED_BY: string;
  CREATED_AT: string;
  UPDATED_AT: string | null;
  CREATED_AT_FMT?: string | null;
  UPDATED_AT_FMT?: string | null;
};

export type SolicitudDiariaColumnSearchKey =
  | 'CLIENT'
  | 'TIPO_REFERENCIA'
  | 'TIPO_PAGO'
  | 'TIPO'
  | 'CONCEPTO'
  | 'NUMERO_REFERENCIA'
  | 'INGRESO_ESTIMADO'
  | 'INGRESO_REAL'
  | 'DIFERENCIA'
  | 'HAS_ANTICIPO'
  | 'OBSERVACIONES'
  | 'CREATED_BY'
  | 'CREATED_AT'
  | 'UPDATED_AT';

export type SolicitudDiariaColumnSearches = Record<SolicitudDiariaColumnSearchKey, string>;

export type SolicitudDiariaSelectFilters = {
  tipoReferencia: string;
  tipoPago: string;
  tipo: string;
  concepto: string;
};

export type SolicitudDiariaReportContext = {
  rows: SolicitudDiariaRow[];
  filters: {
    createdAtFrom: string;
    createdAtTo: string;
    selectFilters: SolicitudDiariaSelectFilters;
    columnSearches: SolicitudDiariaColumnSearches;
  };
};
