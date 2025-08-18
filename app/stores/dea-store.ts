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
};

export const defaultInitState: DEAState = {
  clientNumber: '000041', // RICOH MEXICANA SA DE CV
  custom: '',
  reference: '',
  pdfUrl: '',
  initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  finalDate: new Date(),
  fileName: '',
  getFilesByReferenceKey: '',
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
  resetDEAState: () => void;
};

export type DEAStore = DEAState & DEAActions;

// New helper that builds the URL using reference and client
const getFilesByReference = (reference: string, client: string) => {
  return `/dea/getFilesByReference?reference=${reference}&client=${client}`;
};

export const initDEAStore = (): DEAState => {
  const clientNumber = '000041';
  const reference = '';
  return {
    clientNumber,
    reference,
    custom: '',
    pdfUrl: '',
    initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    finalDate: new Date(),
    fileName: '',
    getFilesByReferenceKey: getFilesByReference(reference, clientNumber),
  };
};

export const createDEAStore = (initState: DEAState = defaultInitState) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,

    setClientNumber: (clientNumber) =>
      set((state) => ({
        clientNumber,
        getFilesByReferenceKey: getFilesByReference(state.reference, clientNumber),
      })),

    setReference: (reference) =>
      set((state) => ({
        reference,
        getFilesByReferenceKey: getFilesByReference(reference, state.clientNumber),
      })),

    setInitialDate: (initialDate) => set(() => ({ initialDate })),

    setFinalDate: (finalDate) => set(() => ({ finalDate })),

    setPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),

    setFile: (fileName) => set(() => ({ fileName })),

    setCustom: (custom) => set(() => ({ custom })),

    setGetFilesByReferenceKey: (getFilesByReferenceKey) => set(() => ({ getFilesByReferenceKey })),
    resetDEAState: () => set(() => ({ ...defaultInitState })),
  }));
};
