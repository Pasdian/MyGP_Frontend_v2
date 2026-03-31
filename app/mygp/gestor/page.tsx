'use client';

import { GestorRefCuentaDataTable } from '@/components/datatables/gestor/GestorRefCuentaDataTable';
import GestorCuentaDialog from '@/components/gestor/GestorCuentaDialog';
import { GestorSearchRef } from '@/components/gestor/GestorSearchRef';
import { gestorRefCuentaColumns } from '@/lib/columns/gestorRefCuentaColumns';
import { Card, CardContent } from '@/components/ui/card';
import { GestorProvider, useGestor } from '@/contexts/Gestor/GestorContext';

export default function Gestor() {
  return (
    <GestorProvider>
      <GestorContent />
    </GestorProvider>
  );
}

export function GestorContent() {
  const { searchRefData, setSearchRefData, refCuenta } = useGestor();

  return (
    <>
      <GestorSearchRef searchRefData={searchRefData} setSearchData={setSearchRefData} />

      {searchRefData.length > 0 && (
        <Card>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="font-semibold text-2xl">Subir archivo(s) al Gestor</p>
            </div>
            <GestorCuentaDialog />
            {refCuenta && (
              <GestorRefCuentaDataTable data={refCuenta} columns={gestorRefCuentaColumns} />
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
