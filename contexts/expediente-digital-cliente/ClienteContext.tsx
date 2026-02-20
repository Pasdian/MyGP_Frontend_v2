// contexts/expediente-digital-cliente/ClienteContext.tsx
'use client';

import React from 'react';
import { GPClient } from '@/lib/axiosUtils/axios-instance';

type ProgressMap = Record<string, number>;

type FolderMappingItem = {
  docKeys: string[];
};

type FolderMappings = Record<string, FolderMappingItem>;

type BackendProgress = {
  client_id: string;
  overall: { scannedFiles: number; requiredFiles: number; progress: number };
  byDocKey: Record<string, { scannedFiles: number; requiredFiles: number; progress: number }>;
};

type ClienteContextType = {
  cliente: string;
  casa_id: string;

  progressMap: ProgressMap;
  setProgressMap: React.Dispatch<React.SetStateAction<ProgressMap>>;

  setCliente: (label: string) => void;
  setCasaId: (value: string) => void;

  folderMappings: FolderMappings;

  getDocKeysForFolder: (folderKey: string) => string[];

  getAccordionClassName: (
    keys: string[],
    progressMap: ProgressMap
  ) =>
    | 'bg-green-700 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-yellow-600 text-white px-2 [&>svg]:text-white mb-2'
    | 'bg-red-800 text-white px-2 [&>svg]:text-white mb-2';

  getProgressFromKeys: (keys: string[], progressMap: ProgressMap) => number;

  // Bulk progress
  refreshAllProgress: () => Promise<void>;
  updateProgressFromSubmitResponse: (folderKey: string, progress: BackendProgress) => void;

  folderMappingsLoading: boolean;
  folderMappingsError: string | null;
  refetchFolderMappings: () => Promise<void>;

  progressLoading: boolean;
  progressError: string | null;
};

type ProgressResponse = {
  client_id: string;
  overall: { scannedFiles: number; requiredFiles: number; progress: number };
  byDocKey: Record<string, { scannedFiles: number; requiredFiles: number; progress: number }>;
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
  const candidate = res.data;

  if (!isFolderMappings(candidate)) {
    throw new Error('Invalid folderMappings response shape');
  }

  return candidate;
}

async function fetchProgressByDocKeys(
  clientId: string,
  docKeys: string[]
): Promise<BackendProgress> {
  const res = await GPClient.get<BackendProgress>(
    '/expediente-digital-cliente/getProgressByDocKeys',
    {
      params: {
        client_rfc: clientId,
        'docKeys[]': docKeys,
      },
    }
  );

  return res.data;
}

function buildProgressMapFromBackend(
  folderMappings: FolderMappings,
  backend: BackendProgress
): ProgressMap {
  const next: ProgressMap = {};

  // docKey progress
  for (const [docKey, v] of Object.entries(backend.byDocKey ?? {})) {
    next[docKey] = Number(v?.progress ?? 0);
  }

  // folder progress computed locally from docKey progress
  for (const [folderKey, item] of Object.entries(folderMappings)) {
    const keys = item?.docKeys ?? [];
    next[folderKey] = getProgressFromKeys(keys, next);
  }

  return next;
}

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState('');
  const [casa_id, setCasaId] = React.useState('');

  const [progressMap, setProgressMap] = React.useState<ProgressMap>({});
  const [progressLoading, setProgressLoading] = React.useState(false);
  const [progressError, setProgressError] = React.useState<string | null>(null);

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

  const allDocKeys = React.useMemo(() => {
    const set = new Set<string>();
    Object.values(folderMappings).forEach((f) => {
      (f?.docKeys ?? []).forEach((k) => set.add(k));
    });
    return Array.from(set);
  }, [folderMappings]);

  const refreshAllProgress = React.useCallback(async () => {
    const clientId = casa_id?.trim();
    if (!clientId) return;
    if (allDocKeys.length === 0) return;

    setProgressLoading(true);
    setProgressError(null);

    try {
      const backend = await fetchProgressByDocKeys(clientId, allDocKeys);
      const next = buildProgressMapFromBackend(folderMappings, backend);
      setProgressMap(next);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch progress';
      setProgressError(message);
    } finally {
      setProgressLoading(false);
    }
  }, [casa_id, allDocKeys, folderMappings]);

  React.useEffect(() => {
    void refreshAllProgress();
  }, [refreshAllProgress]);

  const updateProgressFromSubmitResponse = React.useCallback(
    (folderKey: string, progress: ProgressResponse) => {
      setProgressMap((prev) => {
        const next = { ...prev };

        for (const [docKey, v] of Object.entries(progress.byDocKey ?? {})) {
          next[docKey] = Number(v?.progress ?? 0);
        }

        const keys = folderMappings[folderKey]?.docKeys ?? [];
        next[folderKey] = getProgressFromKeys(keys, next);

        return next;
      });
    },
    [folderMappings]
  );

  const getDocKeysForFolder = React.useCallback(
    (folderKey: string) => folderMappings[folderKey]?.docKeys ?? [],
    [folderMappings]
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

        setCliente,
        setCasaId,

        folderMappings,
        getDocKeysForFolder,
        getAccordionClassName,
        getProgressFromKeys,

        refreshAllProgress,
        updateProgressFromSubmitResponse,

        folderMappingsLoading,
        folderMappingsError,
        refetchFolderMappings,

        progressLoading,
        progressError,
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
