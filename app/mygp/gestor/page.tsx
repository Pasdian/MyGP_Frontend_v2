'use client';

import { GestorRefCuentaDataTable } from '@/components/datatables/gestor/GestorRefCuentaDataTable';
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
            <p className="font-semibold text-2xl mb-4">Subir archivo(s) al Gestor</p>

            {refCuenta && <GestorRefCuentaDataTable data={refCuenta} columns={gestorRefCuentaColumns} />}
          </CardContent>

        </Card>
      )}
    </>
  );
}
