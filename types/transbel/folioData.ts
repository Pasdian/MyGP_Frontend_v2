export type FolioData = {
  message: string;
  data: FolioRow[];
};

export type FolioRow = {
  NUM_REFE: string | null;
  CVE_DAT: number | null;
  ETI_IMPR: string | null;
  DAT_EMB: string | null;
};
