'use client';

import { useRef } from 'react';
import type { GlosaError } from '@/lib/glosa/types';

type Props = {
  title: string;
  accent?: string;
  pins: GlosaError[];
  activePinId: number | null;
  readOnly: boolean;
  onClickEmpty: (pos: { x: number; y: number }) => void;
  onClickPin: (pin: GlosaError) => void;
};

export default function FakePage({
  title,
  accent = '#3B82F6',
  pins,
  activePinId,
  readOnly,
  onClickEmpty,
  onClickPin,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handle = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    onClickEmpty({ x, y });
  };

  return (
    <div className="relative h-full w-full bg-[#E5E5E5] overflow-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div
          ref={ref}
          onClick={handle}
          className={`relative bg-white shadow-md ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
          style={{ width: 620, aspectRatio: '8.5/11' }}
        >
          {/* Faux pedimento content */}
          <div className="absolute inset-0 p-5 text-[8px] leading-tight text-[#0A0A0A] select-none pointer-events-none">
            <div
              className="flex items-center justify-between border-b-2 pb-1 mb-2"
              style={{ borderColor: accent }}
            >
              <div className="font-bold text-[10px]">{title}</div>
              <div className="font-mono">Folio 6001031 · Patente 1914</div>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {['A1', 'EXPORTACIÓN', '370 AICM', '04/03/2026'].map((v, i) => (
                <div key={i} className="border border-[#E5E5E5] p-1">
                  <div className="text-[6px] text-[#737373] uppercase">Campo {i + 1}</div>
                  <div className="font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="border border-[#E5E5E5] p-1 mb-2">
              <div className="text-[6px] text-[#737373] uppercase">Exportador</div>
              <div className="font-semibold">TRANSBEL, S.A. DE C.V. · TRA950227PX7</div>
              <div>Carretera México-Querétaro KM 41.5, Cuautitlán Izcalli, MEX</div>
            </div>
            <div className="border border-[#E5E5E5] p-1 mb-2">
              <div className="text-[6px] text-[#737373] uppercase">Destinatario</div>
              <div className="font-semibold">BELCORP EL SALVADOR S.A DE C.V</div>
              <div>Ctro. Com. La Gran Via Edif. 8, La Libertad, SLV</div>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div className="border border-[#E5E5E5] p-1">
                <div className="text-[6px] text-[#737373]">INCOTERM</div>
                <div className="font-semibold">FCA</div>
              </div>
              <div className="border border-[#E5E5E5] p-1">
                <div className="text-[6px] text-[#737373]">MONEDA</div>
                <div className="font-semibold">USD</div>
              </div>
              <div className="border border-[#E5E5E5] p-1">
                <div className="text-[6px] text-[#737373]">VALOR COMERCIAL</div>
                <div className="font-semibold">24,655.24</div>
              </div>
            </div>
            <div className="text-[7px] font-bold mb-1">PARTIDAS</div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5]">
                  <th className="border border-[#E5E5E5] p-0.5 text-left">#</th>
                  <th className="border border-[#E5E5E5] p-0.5 text-left">Fracción</th>
                  <th className="border border-[#E5E5E5] p-0.5 text-left">Descripción</th>
                  <th className="border border-[#E5E5E5] p-0.5 text-right">Cant.</th>
                  <th className="border border-[#E5E5E5] p-0.5 text-right">Valor USD</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [1, '33030099', 'MITHYKA EAU DE PARFUM', '3,305.000', '9,172.63'],
                  [2, '33030099', 'FEMME MAGNAT PARFUM', '1,022.000', '4,522.49'],
                  [3, '33030099', 'KROMO BLACK PARFUM', '2,000.000', '9,879.62'],
                  [4, '33030099', 'D ORSAY GRAND PARFUM', '305.000', '1,080.50'],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td className="border border-[#E5E5E5] p-0.5">{r[0]}</td>
                    <td className="border border-[#E5E5E5] p-0.5 font-mono">{r[1]}</td>
                    <td className="border border-[#E5E5E5] p-0.5">{r[2]}</td>
                    <td className="border border-[#E5E5E5] p-0.5 text-right font-mono">{r[3]}</td>
                    <td className="border border-[#E5E5E5] p-0.5 text-right font-mono">{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[7px] text-[#737373]">
              Pesos: bruto 1,693.542 kg · neto —
            </div>
            <div className="mt-1 text-[7px] text-[#737373]">
              Medios de transporte: aéreo · Bultos 7 · COVE 01702619PS4O2
            </div>
          </div>

          {/* Pin markers — custom round numbered badges (not shadcn Button to avoid size constraints) */}
          {pins.map((p) => (
            <button
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                onClickPin(p);
              }}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              type="button"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full rounded-bl-none border-2 border-white text-[10px] font-bold text-white shadow-md ${
                  activePinId === p.id
                    ? 'bg-[#3B82F6] ring-2 ring-[#3B82F6]/40 scale-110'
                    : p.status === 'resolved'
                    ? 'bg-[#22C55E]'
                    : 'bg-[#EF4444]'
                }`}
              >
                {p.idx}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
