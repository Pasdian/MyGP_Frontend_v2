import { subMonths, startOfDay, endOfDay } from 'date-fns';
import type { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { DateRange } from 'react-day-picker';
import { createStore } from 'zustand/vanilla';

/**
 * Dates
 */
const today = new Date();
const from = startOfDay(subMonths(today, 1));
const to = endOfDay(today);

/**
 * Domain models grouped into objects so we can remove most individual setters
 */
export type Client = {
  number: string;
  reference: string; // keep if you actually use it; otherwise remove from here and defaults
  custom: string;
};

export type Filters = {
  dateRange: DateRange | undefined;
};

export type FileState = {
  pdfUrl: string;
  textContent: string | undefined | null;
  folder: string;
  filesByReference: getFilesByReference;
  activeFile: string;
};

export type DEAState = {
  client: Client;
  filters: Filters;
  file: FileState;
};

export type DEAActions = {
  /**
   * Shallow patch for the root state (use nested setters below for convenience)
   */
  patch: (partial: Partial<DEAState>) => void;

  /** Update only client fields */
  setClient: (patch: Partial<Client>) => void;
  /** Update only filter fields */
  setFilters: (patch: Partial<Filters>) => void;
  /** Update only file fields */
  setFile: (patch: Partial<FileState>) => void;

  /** Reset to defaults */
  resetFileState: () => void;
  resetClientState: () => void;
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

export const defaultInitState = (): DEAState => ({
  client: {
    number: '',
    reference: '',
    custom: '', // Used in previos
  },
  filters: {
    dateRange: { from, to }, // site-header.tsx date range
  },
  file: {
    pdfUrl: '', // Current pdf url blob
    textContent: '', // Current xml url blob
    folder: '', // Current folder
    filesByReference: emptyFilesByReference(), // Files by reference
    activeFile: '', // Current active file
  },
});

export const initDEAStore = (): DEAState => defaultInitState();

export const createDEAStore = (initState: DEAState = defaultInitState()) => {
  return createStore<DEAStore>()((set) => ({
    ...initState,

    patch: (partial) => set((state) => ({ ...state, ...partial })),

    setClient: (patch) =>
      set((state) => ({
        client: { ...state.client, ...patch },
      })),

    setFilters: (patch) =>
      set((state) => ({
        filters: { ...state.filters, ...patch },
      })),

    setFile: (patch) =>
      set((state) => ({
        file: { ...state.file, ...patch },
      })),

    resetFileState: () =>
      set((state) => {
        if (state.file.pdfUrl.startsWith('blob:')) {
          URL.revokeObjectURL(state.file.pdfUrl);
        }
        return {
          file: {
            pdfUrl: '',
            fileName: '',
            textContent: '',
            folder: '',
            activeFile: '',
            filesByReference: emptyFilesByReference(),
          },
        };
      }),
    resetClientState: () =>
      set(() => ({
        client: {
          number: '',
          reference: '',
          custom: '',
        },
      })),
  }));
};
