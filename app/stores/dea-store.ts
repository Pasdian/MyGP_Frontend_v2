import { createStore } from 'zustand/vanilla';

export type DEAState = {
  clientNumber: string;
  reference: string;
};

export const defaultInitState: DEAState = {
  clientNumber: '',
  reference: '',
};

export type DEAActions = {
  setClientNumber: (clientNumber: string) => void;
  setClickedReference: (clientReference: string) => void;
};

export type DEAStore = DEAState & DEAActions;

export const initDEAStore = (): DEAState => {
  return { clientNumber: '000041', reference: '' };
};

export const createDEAStore = (initState: DEAState = defaultInitState) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,
    setClientNumber: (clientNumber) => set(() => ({ clientNumber })),
    setClickedReference: (reference) => set(() => ({ reference })),
  }));
};
