export interface TransbelApiLog {
  id: number;
  ref?: string | null;
  ee__ge: string;
  revalidacion_073?: string | null;
  ultimo_documento_114?: string | null;
  msa_130?: string | null;
  entrega_transporte_138?: string | null;
  ce_114_138?: string | null;
  entrega_cdp_140?: string | null;
  ce_138_140?: string | null;
  mail_114_138?: Date | string | null;
  mail_138_140?: Date | string | null;
  status?: string | null;

  created_at?: Date | string;
  updated_at?: Date | string;
}
