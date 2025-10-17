export type DailyTracking = {
  NUM_REFE: string | null;
  CVE_IMPO: string | null;
  CLIENT_NAME: string | null;
  ENTRY_DATE: string | null;
  CUSTOM_CLEARANCE_DAYS: string | null;
  CURRENT_PHASE_CODE: string | null;
  CURRENT_PHASE: string | null;
  CUSTOM: string | null;
  KAM: string | null;
  STATUS: string | null;
  MODIFIED_AT: string | null;
  CASA_ID: string | null;
  MSA: string | null;
};

export type DailyTrackingFormatted = DailyTracking & {
  ENTRY_DATE_FORMATTED: string | null;
  MODIFIED_AT_FORMATTED: string | null;
  CUSTOM_FORMATTED: string | null;
  KAM_FORMATTED: string | null;
  MSA_FORMATTED: string | null;
};
