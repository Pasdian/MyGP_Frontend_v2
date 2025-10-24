import type { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { createStore } from 'zustand/vanilla';

export type DEAState = {
  clientNumber: string;
  custom: string;
  reference: string;
  pdfUrl: string;
  initialDate: Date | undefined;
  finalDate: Date | undefined;
  fileName: string;
  folder: string;
  clientName: string;
  filesByReference: getFilesByReference;
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setCustom: (custom: string) => void;
  setReference: (reference: string) => void;
  setInitialDate: (initialDate: Date | undefined) => void;
  setFinalDate: (finalDate: Date | undefined) => void;
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
    initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    finalDate: new Date(),
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
    setInitialDate: (initialDate) => set(() => ({ initialDate })),
    setFinalDate: (finalDate) => set(() => ({ finalDate })),
    setPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),
    setFile: (fileName) => set(() => ({ fileName })),
    setCustom: (custom) => set(() => ({ custom })),
    setFolder: (folder) => set(() => ({ folder })),
    setClientName: (clientName) => set(() => ({ clientName })),

    setFilesByReference: (filesByReference) => set(() => ({ filesByReference })),

    resetDEAState: () => set(() => defaultInitState()),
  }));
};
