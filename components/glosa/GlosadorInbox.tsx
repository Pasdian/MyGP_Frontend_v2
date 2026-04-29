'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Filter, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import InboxTable, { type Column } from './InboxTable';
import StatusPill from './StatusPill';
import { fetchGlosas } from '@/lib/glosa/api';
import type { Glosa } from '@/lib/glosa/types';

export default function GlosadorInbox() {
  const router = useRouter();
  const { data: glosas, error } = useSWR('glosas-glosador', () =>
    fetchGlosas('glosador')
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

  const mine = glosas;
  const grouped = {
    asignadas: mine.filter((g) =>
      ['Nueva', 'En proceso', 'En pausa'].includes(g.status)
    ),
    espera: mine.filter((g) => g.status === 'En espera de cambios'),
    aceptadas: mine.filter((g) => g.status === 'Aceptada'),
    cerradas: mine.filter((g) => g.status === 'Cerrada'),
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
      key: 'tipo',
      label: 'Tipo',
      render: (r) => (
        <Badge variant="outline" className={r.tipo === 'Importación' ? 'text-blue-700' : 'text-purple-700'}>
          {r.tipo}
        </Badge>
      ),
    },
    {
      key: 'kam',
      label: 'KAM',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-[#1E2E6F] text-white">
              {r.kam[0]}
            </AvatarFallback>
          </Avatar>
          <span>{r.kam}</span>
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
      label: 'Errores',
      width: 80,
      render: (r) =>
        r.errores > 0 ? (
          <Badge variant="destructive">{r.errores}</Badge>
        ) : (
          <span className="text-[#A3A3A3]">--</span>
        ),
    },
    { key: 'enviada', label: 'Recibida' },
    {
      key: 'tiempoQA',
      label: 'T. en QA',
      width: 90,
      render: (r) => <span className="font-mono text-[11px]">{r.tiempoQA}</span>,
    },
  ];

  const openGlosa = (r: Glosa) => router.push(`/mygp/glosa/${r.ref}`);
  const inProgress = grouped.asignadas.filter((g) => g.status === 'En proceso').length;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 pt-4 pb-0">
        <div className="flex items-end justify-between pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">
              Módulo de Glosa
            </div>
            <h1 className="text-xl font-bold">Bandeja del Glosador</h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Glosas asignadas automáticamente por carga actual. Puedes pausar el cronómetro en cualquier momento.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-700">
              Carga actual: {inProgress} en proceso
            </Badge>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filtros
            </Button>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              <Download className="h-3.5 w-3.5 mr-1" />
              Exportar CSV
            </Button>
          </div>
        </div>

        <Tabs defaultValue="asignadas">
          <TabsList className="h-auto bg-transparent border-b-0 p-0 gap-0">
            {[
              { value: 'asignadas', label: 'Asignadas', count: grouped.asignadas.length },
              { value: 'espera', label: 'En espera de cambios', count: grouped.espera.length },
              { value: 'aceptadas', label: 'Aceptadas', count: grouped.aceptadas.length },
              { value: 'cerradas', label: 'Cerradas', count: grouped.cerradas.length },
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
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGlosa(r);
                    }}
                  >
                    Glosar
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
