'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Filter, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import InboxTable, { type Column } from './InboxTable';
import StatusPill from './StatusPill';
import { fetchGlosas } from '@/lib/glosa/api';
import type { Glosa } from '@/lib/glosa/types';

const STATUS_FILTERS = ['Todas', 'Nueva', 'En proceso', 'En pausa', 'En espera de cambios', 'Aceptada', 'Cerrada'];

export default function AdminList() {
  const router = useRouter();
  // TODO: wire activeFilter to actual row filtering in a future iteration
  const { data: glosas, error } = useSWR('glosas-admin', () => fetchGlosas('admin'));

  if (error) {
    return <div className="p-4 text-sm text-red-500">Error cargando glosas.</div>;
  }
  if (!glosas) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  const cols: Column<Glosa>[] = [
    { key: 'ref', label: 'Referencia', render: (r) => <span className="font-semibold">{r.ref}</span> },
    { key: 'cliente', label: 'Cliente' },
    { key: 'aduana', label: 'Aduana' },
    {
      key: 'tipo', label: 'Tipo',
      render: (r) => (
        <Badge variant="outline" className={r.tipo === 'Importación' ? 'text-blue-700' : 'text-purple-700'}>
          {r.tipo}
        </Badge>
      ),
    },
    {
      key: 'glosador', label: 'Glosador',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] text-white" style={{ background: '#8B5CF6' }}>
              {r.glosador[0]}
            </AvatarFallback>
          </Avatar>
          <span>{r.glosador}</span>
        </div>
      ),
    },
    { key: 'kam', label: 'KAM' },
    { key: 'status', label: 'Estado', render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'errores', label: 'Errores', width: 80,
      render: (r) => r.errores > 0 ? <Badge variant="destructive">{r.errores}</Badge> : <span className="text-[#A3A3A3]">--</span>,
    },
    { key: 'tiempoQA', label: 'T. QA', width: 80, render: (r) => <span className="font-mono text-[11px]">{r.tiempoQA}</span> },
    { key: 'tiempoKAM', label: 'T. KAM', width: 80, render: (r) => <span className="font-mono text-[11px]">{r.tiempoKAM}</span> },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 pt-4 pb-0">
        <div className="flex items-end justify-between pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">Módulo de Glosa</div>
            <h1 className="text-xl font-bold">Todas las Glosas</h1>
            <p className="text-xs text-[#737373] mt-0.5">Vista general para supervisor. Reasignación, override de estatus y auditoría.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" />Filtros avanzados
            </Button>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              <Download className="h-3.5 w-3.5 mr-1" />Exportar CSV
            </Button>
          </div>
        </div>

        {/* Status quick-filter pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E5E5] bg-[#FAFAFA] px-0 py-2.5">
          <span className="text-[11px] font-semibold text-[#737373]">ESTADO:</span>
          {STATUS_FILTERS.map((s, i) => (
            <button
              key={s}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                i === 0
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'bg-white border-[#E5E5E5] hover:bg-[#F5F5F5]'
              }`}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <InboxTable
          columns={cols}
          rows={glosas}
          onRowClick={(r) => router.push(`/mygp/glosa/${r.ref}`)}
          rowAction={(r) => (
            <div className="flex items-center justify-end gap-1">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Reasignar
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/mygp/glosa/${r.ref}`); }}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
