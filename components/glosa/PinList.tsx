'use client';

import { Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GlosaError } from '@/lib/glosa/types';

type Props = {
  pins: GlosaError[];
  activePinId: number | null;
  onSelect: (pin: GlosaError) => void;
  onResolve: (pin: GlosaError) => void;
  onDelete: (pin: GlosaError) => void;
  readOnly: boolean;
};

function pinTypeTone(type: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (type === 'Dato inexacto') return 'outline';
  if (type === 'Documento incorrecto') return 'destructive';
  return 'secondary';
}

export default function PinList({
  pins,
  activePinId,
  onSelect,
  onResolve,
  onDelete,
  readOnly,
}: Props) {
  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-[#737373]">
        <Pin className="h-6 w-6 mb-2 opacity-50" />
        <div className="text-xs">No hay anotaciones todavía.</div>
        <div className="text-[11px] mt-1">Haz click en el documento para agregar una.</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E5E5E5]">
      {pins.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className={`w-full text-left p-3 hover:bg-[#FAFAFA] ${
            activePinId === p.id
              ? 'bg-blue-50/40 border-l-2 border-[#3B82F6]'
              : ''
          }`}
          type="button"
        >
          <div className="flex items-start gap-2">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                p.status === 'resolved' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
              }`}
            >
              {p.idx}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge variant={pinTypeTone(p.type)} className="text-[10px]">
                  {p.type}
                </Badge>
                <span className="text-[10px] text-[#737373]">· p.{p.page}</span>
              </div>
              <div className="text-[11px] font-semibold truncate">{p.category}</div>
              <div className="text-[11px] text-[#737373] line-clamp-2">{p.note}</div>
              <div className="mt-1 flex items-center justify-between">
                <div className="text-[10px] text-[#A3A3A3] font-mono">
                  {p.file} · {p.createdAt}
                </div>
                {!readOnly && (
                  <div className="flex gap-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(p);
                      }}
                      className="text-[10px] text-[#22C55E] font-semibold hover:underline cursor-pointer"
                    >
                      Resolver
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(p);
                      }}
                      className="text-[10px] text-[#EF4444] font-semibold hover:underline cursor-pointer"
                    >
                      Eliminar
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
