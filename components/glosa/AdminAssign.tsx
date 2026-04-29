'use client';

import useSWR from 'swr';
import { Plus } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import InboxTable, { type Column } from './InboxTable';
import StatusPill from './StatusPill';
import { fetchAsignaciones } from '@/lib/glosa/api';
import type { Glosa, GlosadorLoad } from '@/lib/glosa/types';

export default function AdminAssign() {
  const { data, error } = useSWR('asignaciones', fetchAsignaciones);

  if (error) return <div className="p-4 text-sm text-red-500">Error cargando asignaciones.</div>;
  if (!data) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const { glosadores, recientes } = data;

  const recentCols: Column<Glosa>[] = [
    { key: 'ref', label: 'Referencia', render: (r) => <span className="font-semibold">{r.ref}</span>, filter: false },
    { key: 'cliente', label: 'Cliente', filter: false },
    {
      key: 'glosador', label: 'Asignado a', filter: false,
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
    { key: 'status', label: 'Estado', render: (r) => <StatusPill status={r.status} />, filter: false },
    { key: 'enviada', label: 'Asignada', filter: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 py-4 shrink-0">
        <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">Módulo de Glosa</div>
        <h1 className="text-xl font-bold">Asignaciones</h1>
        <p className="text-xs text-[#737373] mt-0.5">
          Carga actual por glosador. La asignación automática usa round-robin por carga; puedes hacer override manual.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Auto-assignment card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-sm">Asignación automática</div>
              <div className="text-xs text-[#737373]">Round-robin por carga actual (in-progress + nueva).</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox defaultChecked />
                Activa
              </label>
              <Button variant="ghost" size="sm">Reglas</Button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {glosadores.map((g: GlosadorLoad) => (
              <Card key={g.name} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-bold text-white" style={{ background: g.bg }}>
                      {g.init}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{g.name}</div>
                    <div className="text-[10px] text-[#737373]">{g.status ?? 'Disponible'}</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-[#737373] mb-1">
                    <span>Carga actual</span>
                    <span>{g.inProgress}/{g.capacity}</span>
                  </div>
                  <Progress value={(g.inProgress / g.capacity) * 100} className="h-1.5" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-[#737373]">En espera</div>
                    <div className="font-semibold">{g.waiting}</div>
                  </div>
                  <div>
                    <div className="text-[#737373]">T. prom</div>
                    <div className="font-semibold">{g.avgTime}</div>
                  </div>
                  <div>
                    <div className="text-[#737373]">Err. 30d</div>
                    <div className="font-semibold">{g.errors30d}</div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex gap-1">
                  <Button variant="ghost" size="sm" className="flex-1">Pausar</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Reasignar</Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Manual override card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-sm">Override manual — Últimas asignaciones</CardTitle>
            <Button variant="ghost" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />Reasignar manualmente
            </Button>
          </div>
          <InboxTable
            columns={recentCols}
            rows={recientes}
            rowAction={() => (
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Reasignar
              </Button>
            )}
          />
        </Card>
      </div>
    </div>
  );
}
