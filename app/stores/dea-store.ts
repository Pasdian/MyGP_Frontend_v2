import type { getFilesByReference as GetFilesByReference } from '@/types/dea/getFilesByReferences';
import { createStore } from 'zustand/vanilla';

export type DEAState = {
  clientNumber: string;
  custom: string;
  reference: string;
  pdfUrl: string;
  initialDate: Date | undefined;
  finalDate: Date | undefined;
  fileName: string;
  getFilesByReferenceKey: string;
  subfolder: string;
  clientName: string;
  filesByReference: GetFilesByReference;
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setCustom: (custom: string) => void;
  setReference: (reference: string) => void;
  setInitialDate: (initialDate: Date | undefined) => void;
  setFinalDate: (finalDate: Date | undefined) => void;
  setPdfUrl: (pdfUrl: string) => void;
  setFile: (file: string) => void;
  setGetFilesByReferenceKey: (key: string) => void;
  setSubfolder: (subfolder: string) => void;
  setClientName: (clientName: string) => void;
  setFilesByReference: (filesByReference: GetFilesByReference) => void;
  resetDEAState: () => void;
};

export type DEAStore = DEAState & DEAActions;

const buildFilesByReferenceKey = (reference: string, client: string) =>
  `/dea/getFilesByReference?reference=${reference}&client=${client}`;

const emptyFilesByReference = (): GetFilesByReference => ({
  files: {
    '01-CTA-GASTOS': [],
    '02-EXPEDIENTE-ADUANAL': [],
    '03-FISCALES': [],
    '04-VUCEM': [],
    '05-EXP-DIGITAL': [],
    SIN_CLASIFICAR: [],
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
    subfolder: '',
    clientName: '',
    filesByReference: emptyFilesByReference(),
    getFilesByReferenceKey: buildFilesByReferenceKey(reference, clientNumber),
  };
};

export const initDEAStore = (): DEAState => defaultInitState();

export const createDEAStore = (initState: DEAState = defaultInitState()) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,

    setClientNumber: (clientNumber) =>
      set((state) => ({
        clientNumber,
        getFilesByReferenceKey: buildFilesByReferenceKey(state.reference, clientNumber),
      })),

    setReference: (reference) =>
      set((state) => ({
        reference,
        getFilesByReferenceKey: buildFilesByReferenceKey(reference, state.clientNumber),
      })),

    setInitialDate: (initialDate) => set(() => ({ initialDate })),
    setFinalDate: (finalDate) => set(() => ({ finalDate })),
    setPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),
    setFile: (fileName) => set(() => ({ fileName })),
    setCustom: (custom) => set(() => ({ custom })),
    setSubfolder: (subfolder) => set(() => ({ subfolder })),
    setClientName: (clientName) => set(() => ({ clientName })),

    setFilesByReference: (filesByReference) => set(() => ({ filesByReference })),

    setGetFilesByReferenceKey: (getFilesByReferenceKey) => set(() => ({ getFilesByReferenceKey })),

    resetDEAState: () => set(() => defaultInitState()),
  }));
};
