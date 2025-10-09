export type DailyTracking = {
  success: boolean;
  totalRecords: number;
  range: {
    initialDate: string;
    finalDate: string;
  };
  data: DailyTrackingRowFormatted[];
  clients: string[];
  customs: string[];
  phases: string[];
  kams: string[];
};

export type DailyTrackingRow = {
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

export type DailyTrackingRowFormatted = DailyTrackingRow & {
  ENTRY_DATE_FORMATTED: string | null;
  MODIFIED_AT_FORMATTED: string | null;
  CUSTOM_FORMATTED: string | null;
  KAM_FORMATTED: string | null;
};
