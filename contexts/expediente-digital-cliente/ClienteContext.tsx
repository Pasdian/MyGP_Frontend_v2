'use client';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import React from 'react';

type ProgressMap = Record<string, number>;

type FolderMappingItem = {
  docKeys: string[];
};

type FolderMappings = Record<string, FolderMappingItem>;

type ClienteContextType = {
  cliente: string;
  casa_id: string;
  progressMap: ProgressMap;
  setCliente: (label: string) => void;
  setCasaId: (value: string) => void;
  setProgressMap: React.Dispatch<React.SetStateAction<ProgressMap>>;

  folderMappings: FolderMappings;

  getDocKeysForFolder: (folderKey: string) => string[];

  setFolderProgressFromDocKeys: (folderKey: string, docKeys: readonly string[]) => void;

  getAccordionClassName: (
    keys: string[],
    progressMap: ProgressMap
  ) =>
    | 'bg-green-700 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-red-800 text-white px-2 [&>svg]:text-white mb-2';

  getProgressFromKeys: (keys: string[], progressMap: ProgressMap) => number;

  folderMappingsLoading: boolean;
  folderMappingsError: string | null;
  refetchFolderMappings: () => Promise<void>;
};

const ClienteContext = React.createContext<ClienteContextType | undefined>(undefined);

export const getProgressFromKeys = (keys: string[], progressMap: ProgressMap) => {
  if (keys.length === 0) return 0;

  const total = keys.reduce((sum, key) => sum + Number(progressMap[key] ?? 0), 0);
  return Math.round(total / keys.length);
};

function isFolderMappings(value: unknown): value is FolderMappings {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return Object.values(record).every((v) => {
    if (!v || typeof v !== 'object') return false;
    const item = v as Record<string, unknown>;
    if (!Array.isArray(item.docKeys)) return false;
    return item.docKeys.every((x) => typeof x === 'string');
  });
}

async function fetchFolderMappings(): Promise<FolderMappings> {
  const res = await GPClient.get('/expediente-digital-cliente/folderMappings');
  const data = res.data;

  // If your backend wraps responses sometimes, you can extend this:
  // const candidate = data?.folderMappings ?? data;
  const candidate = data;

  if (!isFolderMappings(candidate)) {
    throw new Error('Invalid folderMappings response shape');
  }

  return candidate;
}

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState('');
  const [casa_id, setCasaId] = React.useState('');
  const [progressMap, setProgressMap] = React.useState<ProgressMap>({});

  const [folderMappings, setFolderMappings] = React.useState<FolderMappings>({});
  const [folderMappingsLoading, setFolderMappingsLoading] = React.useState(false);
  const [folderMappingsError, setFolderMappingsError] = React.useState<string | null>(null);

  const refetchFolderMappings = React.useCallback(async () => {
    setFolderMappingsLoading(true);
    setFolderMappingsError(null);

    try {
      const mappings = await fetchFolderMappings();
      setFolderMappings(mappings);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch folderMappings';
      setFolderMappingsError(message);
    } finally {
      setFolderMappingsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refetchFolderMappings();
  }, [refetchFolderMappings]);

  const getDocKeysForFolder = React.useCallback(
    (folderKey: string) => folderMappings[folderKey]?.docKeys ?? [],
    [folderMappings]
  );

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
        folderMappings,
        getDocKeysForFolder,
        setFolderProgressFromDocKeys,
        getAccordionClassName,
        getProgressFromKeys,
        setCliente,
        setCasaId,
        folderMappingsLoading,
        folderMappingsError,
        refetchFolderMappings,
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
