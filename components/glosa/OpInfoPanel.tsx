'use client';

import type { Glosa } from '@/lib/glosa/types';

type Props = { glosa: Glosa };

export default function OpInfoPanel({ glosa }: Props) {
  const rows: [string, string][] = [
    ['Referencia',  glosa.ref || '—'],
    ['Tipo',        glosa.tipo || '—'],
    ['Cliente',     glosa.cliente || '—'],
    ['Aduana',      glosa.aduana || '—'],
    ['Glosador',    glosa.glosador || '—'],
    ['KAM',         glosa.kam || '—'],
    ['Estado',      glosa.status || '—'],
    ['Enviada',     glosa.enviada || '—'],
    ['T. QA',       glosa.tiempoQA || '—'],
    ['T. KAM',      glosa.tiempoKAM || '—'],
    ['Pedimento',   glosa.m || '—'],
    ['Monto',       glosa.monto || '—'],
  ];

  return (
    <div className="divide-y divide-[#F0F0F0]">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-start justify-between gap-2 px-3 py-1.5 text-[11px]"
        >
          <span className="text-[#737373]">{k}</span>
          <span className="font-semibold text-right font-mono">{v}</span>
        </div>
      ))}
    </div>
  );
}
