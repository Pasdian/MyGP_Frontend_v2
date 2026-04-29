'use client';

import { Check, X } from 'lucide-react';
import { MOCK_VALIDACIONES } from '@/lib/glosa/mockData';

export default function ValidationsPanel() {
  return (
    <div className="divide-y divide-[#F0F0F0]">
      {MOCK_VALIDACIONES.map((v, i) => (
        <div key={i} className="px-3 py-2 text-[11px]">
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                v.ok ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
              } text-white`}
            >
              {v.ok ? (
                <Check className="h-2 w-2" />
              ) : (
                <X className="h-2 w-2" />
              )}
            </div>
            <span className="font-semibold">{v.field}</span>
          </div>
          <div className="pl-5 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-[#737373]">Pedimento / M</div>
              <div className="font-mono">{v.pedimento}</div>
            </div>
            <div>
              <div className="text-[#737373]">Factura / CASA</div>
              <div className="font-mono">{v.factura}</div>
            </div>
          </div>
          <div
            className={`pl-5 mt-0.5 text-[10px] ${
              v.ok ? 'text-[#22C55E]' : 'text-[#EF4444]'
            }`}
          >
            {v.hint}
          </div>
        </div>
      ))}
    </div>
  );
}
