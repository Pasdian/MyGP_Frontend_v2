export type SolicitudDiariaRow = {
  ID_SOLICITUD: number;
  CLIENT: string;
  REPROGRAMACION: boolean;
  MOTIVO_REPROGRAMACION: string | null;
  TIPO_REFERENCIA: string;
  TIPO_PAGO: string;
  TIPO: string;
  CONCEPTO: string;
  NUMERO_REFERENCIA: string;
  INGRESO_ESTIMADO: number;
  INGRESO_REAL: number | null;
  DIFERENCIA: number | null;
  HAS_ANTICIPO: boolean;
  OBSERVACIONES: string;
  CREATED_BY: string;
  CREATED_AT: string;
  CREATED_AT_FMT?: string | null;
};
