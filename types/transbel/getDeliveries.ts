export type getDeliveries = {
  REFERENCIA: string | null;
  EE__GE: string | null;
  GUIA_HOUSE: string | null;
  ENTREGA_TRANSPORTE_138: string | null;
  CE_138: string | null;
  ENTREGA_CDP_140: string | null;
  CE_140: string | null;
  has_guia_house_error: boolean;
  has_entrega_cdp_error: boolean;
  has_entrega_transporte_error: boolean;
  BUSINESS_DAYS_ERROR_MSG?: string;
  MSA_130_ERROR_MSG?: string;
  ENTREGA_TRANSPORTE_138_ERROR_MSG?: string;
  ENTREGA_CDP_140_ERROR_MSG?: string;
  GUIA_HOUSE_ERROR_MSG?: string;
};

export type getDeliveriesFormat = getDeliveries & {
  ENTREGA_TRANSPORTE_138_FORMATTED: string | null;
  ENTREGA_CDP_140_FORMATTED: string | null;
};
