export type getCargues = {
  NUM_REFE: string | null;
  NUM_PEDI: string | null;
  EE: string | null;
  GE: string | null;
  CECO: string | null;
  FEC_PAGO: string | null;
  FEC_ENVIO: string | null;
  has_error: boolean;
  FEC_PAGO_ERROR_MSG: string | null;
  paid: boolean | null;
  pending: boolean | null;
};

export type getCarguesFormat = getCargues & {
  FEC_PAGO_FORMATTED: string | null;
  FEC_ENVIO_FORMATTED: string | null;
  NUM_TRAFICO: string | null;
};
