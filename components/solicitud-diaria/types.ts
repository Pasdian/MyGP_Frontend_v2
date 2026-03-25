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
