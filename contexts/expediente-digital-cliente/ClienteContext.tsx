'use client';

import React from 'react';

type ProgressMap = Record<string, number>;

type ClienteContextType = {
  cliente: string;
  casa_id: string;
  progressMap: ProgressMap;
  setCliente: (label: string) => void;
  setCasaId: (value: string) => void;
  setProgressMap: React.Dispatch<React.SetStateAction<ProgressMap>>;

  folderDocKeys: Record<string, string[]>;
  setFolderProgressFromDocKeys: (folderKey: string, docKeys: readonly string[]) => void;

  getAccordionClassName: (
    keys: string[],
    progressMap: ProgressMap
  ) =>
    | 'bg-green-700 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-red-800 text-white px-2 [&>svg]:text-white mb-2';

  getProgressFromKeys: (keys: string[], progressMap: ProgressMap) => number;
};

const ClienteContext = React.createContext<ClienteContextType | undefined>(undefined);

export const getProgressFromKeys = (keys: string[], progressMap: ProgressMap) => {
  if (keys.length === 0) return 0;

  const total = keys.reduce((sum, key) => sum + Number(progressMap[key] ?? 0), 0);
  return Math.round(total / keys.length);
};

const DEFAULT_FOLDER_DOC_KEYS: Record<string, string[]> = {
  'imp.docs': ['imp.legal.acta', 'imp.legal.poder'],
  'imp.contact': [
    'imp.contact.domicilio',
    'imp.contact.fotos_fiscal',
    'imp.contact.fotos_inmueble',
    'imp.contact.fotos_actividades',
  ],
  // Add more here when you implement them:
  // 'imp.tax': [...],
  // 'rep.docs': [...],
  // 'manifiestos': [...],
  // 'agent.docs': [...],
};

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState('');
  const [casa_id, setCasaId] = React.useState('');
  const [progressMap, setProgressMap] = React.useState<ProgressMap>({});

  const folderDocKeys = React.useMemo(() => DEFAULT_FOLDER_DOC_KEYS, []);

  const setFolderProgressFromDocKeys = React.useCallback(
    (folderKey: string, docKeys: readonly string[]) => {
      setProgressMap((prev) => {
        const next = { ...prev };
        next[folderKey] = getProgressFromKeys([...docKeys], next);
        return next;
      });
    },
    []
  );

  const getAccordionClassName = (keys: string[], progressMap: ProgressMap) => {
    const success = 'bg-green-700 text-white px-2 [&>svg]:text-white mb-2';
    const warning = 'bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2';
    const danger = 'bg-red-800 text-white px-2 [&>svg]:text-white mb-2';

    if (keys.length === 0) return danger;

    const averageProgress = getProgressFromKeys(keys, progressMap);

    if (averageProgress < 50) return danger;
    if (averageProgress < 99) return warning;
    return success;
  };

  return (
    <ClienteContext.Provider
      value={{
        cliente,
        casa_id,
        progressMap,
        setProgressMap,
        folderDocKeys,
        setFolderProgressFromDocKeys,
        getAccordionClassName,
        getProgressFromKeys,
        setCliente,
        setCasaId,
      }}
    >
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const context = React.useContext(ClienteContext);
  if (!context) throw new Error('useCliente must be used within ClienteProvider');
  return context;
}
