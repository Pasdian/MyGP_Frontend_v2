import { createStore } from 'zustand/vanilla';

export type DEAState = {
  clientNumber: string;
  reference: string;
  pdfUrl: string;
  initialDate: Date | undefined;
  finalDate: Date | undefined;
  file: string;
};

export const defaultInitState: DEAState = {
  clientNumber: '',
  reference: '',
  pdfUrl: '',
  initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  finalDate: new Date(),
  file: '',
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setClickedReference: (clientReference: string) => void;
  setInitialDate: (initialDate: Date | undefined) => void;
  setFinalDate: (finalDate: Date | undefined) => void;
  setPdfUrl: (pdfUrl: string) => void;
  setFile: (file: string) => void;
};

export type DEAStore = DEAState & DEAActions;

export const initDEAStore = (): DEAState => {
  return {
    clientNumber: '000041',
    reference: '',
    pdfUrl: '',
    initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    finalDate: new Date(),
    file: '',
  };
};

export const createDEAStore = (initState: DEAState = defaultInitState) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,
    setClientNumber: (clientNumber) => set(() => ({ clientNumber })),
    setClickedReference: (reference) => set(() => ({ reference })),
    setInitialDate: (initialDate) => set(() => ({ initialDate })),
    setFinalDate: (finalDate) => set(() => ({ finalDate })),
    setPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),
    setFile: (file) => set(() => ({ file })),
  }));
};
