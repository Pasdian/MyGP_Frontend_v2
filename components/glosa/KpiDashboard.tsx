'use client';

import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = { scope: 'admin' | 'glosador' };

type KpiCardProps = { label: string; value: string; delta?: string; color: string };

function KpiCard({ label, value, delta, color }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        {delta && <div className="text-[11px] text-[#737373]">{delta}</div>}
      </div>
    </Card>
  );
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const VOLUME_DATA = [8, 12, 10, 15, 14, 6, 3].map((v, i) => ({ dia: DAYS[i], count: v }));

const ERROR_TIPOS = [
  { tipo: 'Dato inexacto', count: 142, color: '#EAB308' },
  { tipo: 'Incongruencia con documento', count: 98, color: '#8B5CF6' },
  { tipo: 'Documento incorrecto', count: 47, color: '#EF4444' },
];

const ERROR_CATEGORIAS = [
  ['Valor factura vs pedimento', 68],
  ['Incoterm vs factura', 42],
  ['Peso bruto / neto', 36],
  ['Fracción arancelaria', 29],
  ['RFCs', 22],
  ['Fecha de entrada', 18],
  ['Firma / sello', 15],
  ['Otros', 57],
] as const;

const ERROR_KAM = [
  { name: 'Javier R.', count: 58, color: '#3B82F6' },
  { name: 'Andrea P.', count: 42, color: '#8B5CF6' },
  { name: 'Rodrigo H.', count: 38, color: '#EAB308' },
  { name: 'Carolina T.', count: 25, color: '#22C55E' },
  { name: 'Fernando L.', count: 19, color: '#EF4444' },
];

const GLOSADORES_PERF = [
  { name: 'María G.', init: 'M', bg: '#8B5CF6', g30: 38, tqa: '1h 45m', tkam: '4h 10m', sc: '1.3', ta: '62%', err: 74 },
  { name: 'Carlos M.', init: 'C', bg: '#3B82F6', g30: 42, tqa: '2h 10m', tkam: '3h 55m', sc: '1.5', ta: '58%', err: 88 },
  { name: 'Ana L.', init: 'A', bg: '#EAB308', g30: 35, tqa: '1h 30m', tkam: '4h 40m', sc: '1.1', ta: '71%', err: 51 },
  { name: 'Diego V.', init: 'D', bg: '#22C55E', g30: 27, tqa: '2h 00m', tkam: '5h 05m', sc: '1.8', ta: '44%', err: 74 },
];

export default function KpiDashboard({ scope }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#E5E5E5] bg-white px-4 py-4 shrink-0">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[#737373] font-semibold">Módulo de Glosa</div>
            <h1 className="text-xl font-bold">{scope === 'admin' ? 'Trazabilidad y KPIs' : 'Mis KPIs'}</h1>
            <p className="text-xs text-[#737373] mt-0.5">
              Seguimiento de tiempos, volumen y errores por categoría / usuario / aduana / cliente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="h-8 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
              <Download className="h-3.5 w-3.5 mr-1" />Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-5 gap-3">
          <KpiCard label="Glosas activas"  value="14"       delta="+3 vs sem"  color="#3B82F6" />
          <KpiCard label="T. prom en QA"   value="1h 52m"   delta="−8m"        color="#22C55E" />
          <KpiCard label="T. prom con KAM" value="4h 18m"   delta="+22m"       color="#EAB308" />
          <KpiCard label="Cerradas 30d"    value="142"      delta="+18%"       color="#3B82F6" />
          <KpiCard label="Errores 30d"     value="287"      delta="−5%"        color="#EF4444" />
        </div>

        {/* Volume + error type */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 col-span-2">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm">Glosas por día</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VOLUME_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="dia" tick={{ fontSize: 9, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm mb-3">Errores por tipo</CardTitle>
            <div className="space-y-2 text-[12px]">
              {ERROR_TIPOS.map((e) => (
                <div key={e.tipo}>
                  <div className="flex justify-between mb-0.5">
                    <span>{e.tipo}</span>
                    <span className="font-semibold">{e.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${(e.count / 142) * 100}%`, background: e.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Error by category + by KAM */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <CardTitle className="text-sm mb-3">Errores por categoría</CardTitle>
            <div className="space-y-1.5 text-[11px]">
              {ERROR_CATEGORIAS.map(([l, v]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-36 text-[#737373] truncate">{l}</div>
                  <Progress value={(v / 68) * 100} className="flex-1 h-2" />
                  <div className="w-8 text-right font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm mb-3">Errores por KAM</CardTitle>
            <div className="space-y-1.5 text-[11px]">
              {ERROR_KAM.map((k) => (
                <div key={k.name} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] text-white" style={{ background: k.color }}>
                      {k.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-24">{k.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
                    <div className="h-full" style={{ width: `${(k.count / 58) * 100}%`, background: k.color }} />
                  </div>
                  <div className="w-8 text-right font-semibold">{k.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Glosador performance table */}
        <Card className="p-4">
          <CardTitle className="text-sm mb-3">Desempeño por glosador</CardTitle>
          <Table className="text-[11px]">
            <TableHeader>
              <TableRow className="text-left text-[#737373]">
                <TableHead>Glosador</TableHead>
                <TableHead>Glosas 30d</TableHead>
                <TableHead>T. prom QA</TableHead>
                <TableHead>T. prom KAM</TableHead>
                <TableHead>Sol. cambio</TableHead>
                <TableHead>Tasa aceptación</TableHead>
                <TableHead>Errores detectados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {GLOSADORES_PERF.map((g) => (
                <TableRow key={g.name} className="border-b border-[#F0F0F0]">
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] text-white" style={{ background: g.bg }}>
                          {g.init}
                        </AvatarFallback>
                      </Avatar>
                      {g.name}
                    </div>
                  </TableCell>
                  <TableCell>{g.g30}</TableCell>
                  <TableCell className="font-mono">{g.tqa}</TableCell>
                  <TableCell className="font-mono">{g.tkam}</TableCell>
                  <TableCell>{g.sc}</TableCell>
                  <TableCell>{g.ta}</TableCell>
                  <TableCell>{g.err}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
