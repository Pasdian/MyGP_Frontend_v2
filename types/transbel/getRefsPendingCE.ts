export type getRefsPendingCE = {
  REFERENCIA: string | null;
  EE__GE: string | null;
  ADU_DESP: string | null;
  REVALIDACION_073: string | null;
  ULTIMO_DOCUMENTO_114: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string | null;
  MSA_130: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
  has_error: boolean;
  BUSINESS_DAYS_ERROR_MSG?: string;
  REVALIDACION_073_ERROR_MSG?: string;
  ULTIMO_DOCUMENTO_114_ERROR_MSG?: string;
  MSA_130_ERROR_MSG?: string;
  ENTREGA_TRANSPORTE_138_ERROR_MSG?: string;
  was_send_to_workato: boolean;
  workato_created_at: string | null;
  ENTREGA_CDP_140_ERROR_MSG: string | null;
};

export type getRefsPendingCEFormat = getRefsPendingCE & {
  REVALIDACION_073_FORMATTED: string | null;
  ULTIMO_DOCUMENTO_114_FORMATTED: string | null;
  ENTREGA_TRANSPORTE_138_FORMATTED: string | null;
  MSA_130_FORMATTED: string | null;
  ENTREGA_CDP_140_FORMATTED: string | null;
  workato_created_at_FORMATTED: string | null;
};
