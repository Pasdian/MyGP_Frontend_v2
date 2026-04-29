'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Filter, Plus, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import InboxTable, { type Column } from './InboxTable';
import StatusPill from './StatusPill';
import { fetchGlosas } from '@/lib/glosa/api';
import type { Glosa } from '@/lib/glosa/types';

export default function KamInbox() {
  const router = useRouter();
  const { data: glosas, error } = useSWR('glosas-kam', () =>
    fetchGlosas('kam')
  );

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        Error cargando glosas. Intenta de nuevo.
      </div>
    );
  }

  if (!glosas) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const grouped = {
    activas: glosas.filter((g) =>
      ['Nueva', 'En proceso', 'En pausa'].includes(g.status)
    ),
    cambios: glosas.filter((g) => g.status === 'En espera de cambios'),
    aprobadas: glosas.filter((g) =>
      ['Aceptada', 'Cerrada'].includes(g.status)
    ),
  };

  const cols: Column<Glosa>[] = [
    {
      key: 'ref',
      label: 'Referencia',
      render: (r) => <span className="font-semibold">{r.ref}</span>,
    },
    { key: 'cliente', label: 'Cliente' },
    { key: 'aduana', label: 'Aduana' },
    {
      key: 'glosador',
      label: 'Glosador',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className="text-[10px] text-white"
              style={{ background: '#8B5CF6' }}
            >
              {r.glosador[0]}
            </AvatarFallback>
          </Avatar>
          <span>{r.glosador}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (r) => <StatusPill status={r.status} />,
    },
    {
      key: 'errores',
      label: 'Cambios',
      width: 90,
      render: (r) =>
        r.errores > 0 ? (
          <Badge variant="destructive">{r.errores}</Badge>
        ) : (
          <span className="text-[#A3A3A3]">--</span>
        ),
    },
    { key: 'enviada', label: 'Enviada' },
    {
      key: 'tiempoKAM',
      label: 'T. contigo',
      width: 100,
      render: (r) => <span className="font-mono text-[11px]">{r.tiempoKAM}</span>,
    },
  ];

  const openGlosa = (r: Glosa) => router.push(`/mygp/glosa/${r.ref}`);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 pt-4 pb-0">
        <div className="flex items-end justify-between pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">
              Módulo de Glosa
            </div>
            <h1 className="text-xl font-bold">Mis Glosas</h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Operaciones que enviaste a revisión del equipo de QA.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filtros
            </Button>
            <Button size="sm" onClick={() => router.push('/mygp/glosa/enviar')}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nueva Glosa
            </Button>
          </div>
        </div>

        <Tabs defaultValue="activas">
          <TabsList className="h-auto bg-transparent border-b-0 p-0 gap-0">
            {[
              { value: 'activas', label: 'En glosa', count: grouped.activas.length },
              { value: 'cambios', label: 'Cambios solicitados', count: grouped.cambios.length },
              { value: 'aprobadas', label: 'Aprobadas / Cerradas', count: grouped.aprobadas.length },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B82F6] data-[state=active]:text-[#0A0A0A] text-[#737373] px-3 py-2 text-[13px] font-semibold"
              >
                {t.label}
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                  {t.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(grouped).map(([key, rows]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <InboxTable
                columns={cols}
                rows={rows}
                onRowClick={openGlosa}
                rowAction={(r) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGlosa(r);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Ver
                  </Button>
                )}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
