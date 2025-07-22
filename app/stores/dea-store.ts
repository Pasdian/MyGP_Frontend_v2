import { createStore } from 'zustand/vanilla';

export type DEAState = {
  clientNumber: string;
  reference: string;
  initialDate: Date | undefined;
  finalDate: Date | undefined;
};

export const defaultInitState: DEAState = {
  clientNumber: '',
  reference: '',
  initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  finalDate: new Date(),
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setClickedReference: (clientReference: string) => void;
  setInitialDate: (initialDate: Date | undefined) => void;
  setFinalDate: (finalDate: Date | undefined) => void;
};

export type DEAStore = DEAState & DEAActions;

export const initDEAStore = (): DEAState => {
  return {
    clientNumber: '000041',
    reference: '',
    initialDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    finalDate: new Date(),
  };
};

export const createDEAStore = (initState: DEAState = defaultInitState) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,
    setClientNumber: (clientNumber) => set(() => ({ clientNumber })),
    setClickedReference: (reference) => set(() => ({ reference })),
    setInitialDate: (initialDate) => set(() => ({ initialDate })),
    setFinalDate: (finalDate) => set(() => ({ finalDate })),
  }));
};
