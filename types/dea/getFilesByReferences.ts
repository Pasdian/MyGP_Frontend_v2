export type getFilesByReference = {
  files: {
    '01-CTA-GASTOS': string[];
    '02-EXPEDIENTE-ADUANAL': string[];
    '03-FISCALES': string[];
    '04-VUCEM': string[];
    '05-EXP-DIGITAL': string[];
  };
  message: string;
};

export type FolderKey =
  | '01-CTA-GASTOS'
  | '02-EXPEDIENTE-ADUANAL'
  | '03-FISCALES'
  | '04-VUCEM'
  | '05-EXP-DIGITAL';
