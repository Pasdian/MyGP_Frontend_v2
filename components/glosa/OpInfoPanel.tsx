'use client';

import { MOCK_OP_INFO } from '@/lib/glosa/mockData';

const ROWS: [string, string][] = [
  ['Referencia',     MOCK_OP_INFO.ref],
  ['Pedimento',      MOCK_OP_INFO.pedimento],
  ['Patente',        MOCK_OP_INFO.patente],
  ['Tipo',           MOCK_OP_INFO.tipoOp],
  ['Aduana',         MOCK_OP_INFO.aduana],
  ['Cliente',        MOCK_OP_INFO.cliente],
  ['RFC Cliente',    MOCK_OP_INFO.clienteRFC],
  ['Destinatario',   MOCK_OP_INFO.destinatario],
  ['País destino',   MOCK_OP_INFO.paisDestino],
  ['Incoterm',       MOCK_OP_INFO.incoterm],
  ['Moneda',         MOCK_OP_INFO.moneda],
  ['Valor comercial',MOCK_OP_INFO.valorComercial],
  ['Fecha entrada',  MOCK_OP_INFO.fechaEntrada],
  ['Peso bruto',     MOCK_OP_INFO.pesoBruto],
  ['Bultos',         MOCK_OP_INFO.bultos],
  ['Archivo M',      MOCK_OP_INFO.m],
];

export default function OpInfoPanel() {
  return (
    <div className="divide-y divide-[#F0F0F0]">
      {ROWS.map(([k, v]) => (
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
