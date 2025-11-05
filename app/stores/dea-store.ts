import { subMonths, startOfDay, endOfDay } from 'date-fns';
import type { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { DateRange } from 'react-day-picker';
import { createStore } from 'zustand/vanilla';

const today = new Date();
const from = startOfDay(subMonths(today, 1));
const to = endOfDay(today);

export type DEAState = {
  clientNumber: string;
  custom: string;
  reference: string;
  pdfUrl: string;
  dateRange: DateRange | undefined;
  fileName: string;
  folder: string;
  clientName: string;
  filesByReference: getFilesByReference;
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setCustom: (custom: string) => void;
  setReference: (reference: string) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setPdfUrl: (pdfUrl: string) => void;
  setFile: (file: string) => void;
  setFolder: (folder: string) => void;
  setClientName: (clientName: string) => void;
  setFilesByReference: (filesByReference: getFilesByReference) => void;
  resetDEAState: () => void;
};

export type DEAStore = DEAState & DEAActions;

const emptyFilesByReference = (): getFilesByReference => ({
  files: {
    '01-CTA-GASTOS': [],
    '02-EXPEDIENTE-ADUANAL': [],
    '03-FISCALES': [],
    '04-VUCEM': [],
    '05-EXP-DIGITAL': [],
  },
  message: '',
});

export const defaultInitState: () => DEAState = () => {
  const clientNumber = '';
  const reference = '';
  return {
    clientNumber,
    custom: '',
    reference,
    pdfUrl: '',
    dateRange: { from, to },
    fileName: '',
    folder: '',
    clientName: '',
    filesByReference: emptyFilesByReference(),
  };
};

export const initDEAStore = (): DEAState => defaultInitState();

export const createDEAStore = (initState: DEAState = defaultInitState()) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,
    setClientNumber: (clientNumber) =>
      set(() => ({
        clientNumber,
      })),
    setReference: (reference) =>
      set(() => ({
        reference,
      })),
    setDateRange: (dateRange) => set(() => ({ dateRange })),
    setPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),
    setFile: (fileName) => set(() => ({ fileName })),
    setCustom: (custom) => set(() => ({ custom })),
    setFolder: (folder) => set(() => ({ folder })),
    setClientName: (clientName) => set(() => ({ clientName })),

    setFilesByReference: (filesByReference) => set(() => ({ filesByReference })),

    resetDEAState: () => set(() => defaultInitState()),
  }));
};
