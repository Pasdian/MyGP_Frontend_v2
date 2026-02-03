import * as React from 'react';
import useSWR from 'swr';
import { TreeView } from '@/components/ui/tree-view'; // adjust import to your TreeView component
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { toTreeData } from '@/lib/utilityFunctions/toTreeData';
import { Folder } from 'lucide-react';
import { Client } from '@/app/stores/dea-store';

export function ManifestacionTree({ client }: { client: Client }) {
  const {
    data: list,
    isLoading,
    error,
  } = useSWR<Record<string, string[]> | undefined>(
    `/dea/scan?source=/GESTION/${client.number}/${client.reference}/06-MANIFESTACION-VALOR`,
    axiosFetcher
  );

  if (isLoading) return <div className="text-sm text-gray-500">Cargando...</div>;
  if (error) return <div className="text-sm text-red-600">Error al cargar archivos</div>;
  if (!list) return <div className="text-sm text-gray-400">Sin datos disponibles</div>;

  const data = toTreeData(list);

  return (
    <div className="p-2">
      <TreeView defaultNodeIcon={Folder} data={data} />
    </div>
  );
}
