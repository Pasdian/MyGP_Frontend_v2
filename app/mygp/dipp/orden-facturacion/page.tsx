'use client';

import { OrdenFacturacionHeader } from '@/components/orden-facturacion/OrdenFacturacionHeader';
import { DatosReferencia } from '@/components/orden-facturacion/DatosReferencia';
import { DetallesFinanciamiento } from '@/components/orden-facturacion/DetallesFinanciamiento';
import { GastosAComprobar } from '@/components/orden-facturacion/GastosAComprobar';
import { OrdenFacturacionProvider } from '@/contexts/dipp/OrdenFacturacionContext';
import { InstruccionesAdicionales } from '@/components/orden-facturacion/InstruccionesAdicionales';
import { ExpedienteDigitalChecklist } from '@/components/orden-facturacion/ExpedienteDigitalChecklist';

export default function OrdenFacturacion() {
  return (
    <OrdenFacturacionProvider>
      <div>
        <div className="mb-4">
          <OrdenFacturacionHeader />
        </div>
        <div className="mb-4">
          <DatosReferencia />
        </div>
        <div className="mb-4">
          <DetallesFinanciamiento />
        </div>
        <div className="mb-4">
          <GastosAComprobar />
        </div>
        <div className="mb-4">
          <GastosAComprobar isAmericana />
        </div>
        <div className="mb-4">
          <InstruccionesAdicionales />
        </div>
        <div>
          <ExpedienteDigitalChecklist />
        </div>
      </div>
    </OrdenFacturacionProvider>
  );
}
