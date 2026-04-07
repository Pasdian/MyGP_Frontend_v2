'use client';

import * as React from 'react';
import type { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { useDEAParams } from '@/hooks/useDEAParams';

// --- Ephemeral state types ---

export type DEAContextValue = {
  pdfUrl: string;
  textContent: string | null | undefined;
  filesByReference: getFilesByReference;
  setPdfUrl: (url: string) => void;
  setTextContent: (content: string | null | undefined) => void;
  setFilesByReference: (data: getFilesByReference) => void;
  resetFile: () => void;
};

// --- Helpers ---

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

// --- Context ---

const DEAContext = React.createContext<DEAContextValue | null>(null);

// --- Provider ---

export function DEAProvider({ children }: { children: React.ReactNode }) {
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [textContent, setTextContent] = React.useState<string | null | undefined>(null);
  const [filesByReference, setFilesByReference] = React.useState<getFilesByReference>(
    emptyFilesByReference()
  );

  const { client, reference } = useDEAParams();

  const resetFile = React.useCallback(() => {
    setPdfUrl((prev) => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return '';
    });
    setTextContent(null);
    setFilesByReference(emptyFilesByReference());
  }, []);

  // Auto-reset ephemeral state when client or reference URL params change.
  // INTENTIONALLY omit resetFile from deps to avoid infinite re-render loop.
  React.useEffect(() => {
    resetFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, reference]);

  const value = React.useMemo<DEAContextValue>(
    () => ({
      pdfUrl,
      textContent,
      filesByReference,
      setPdfUrl,
      setTextContent,
      setFilesByReference,
      resetFile,
    }),
    [pdfUrl, textContent, filesByReference, resetFile]
  );

  return <DEAContext.Provider value={value}>{children}</DEAContext.Provider>;
}

// --- Hook ---

export function useDEAContext(): DEAContextValue {
  const ctx = React.useContext(DEAContext);
  if (!ctx) {
    throw new Error('useDEAContext must be used within DEAProvider');
  }
  return ctx;
}
