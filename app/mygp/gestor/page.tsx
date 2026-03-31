'use client';

import React from 'react';
import useSWR from 'swr';
import { GestorRefCuentaDataTable } from '@/components/datatables/gestor/GestorRefCuentaDataTable';
import GestorUploadFileDialog from '@/components/gestor/GestorUploadFileDialog';
import { GestorSearchRef } from '@/components/gestor/GestorSearchRef';
import { gestorRefCuentaColumns } from '@/lib/columns/gestorRefCuentaColumns';
import { Card, CardContent } from '@/components/ui/card';
import { GestorRefInfo } from '@/types/gestor/GestorRefInfo';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

export default function Gestor() {
  return <GestorContent />;
}

export function GestorContent() {
  const [searchRefData, setSearchRefData] = React.useState<GestorRefInfo[]>([]);
  const activeReference = searchRefData[0]?.NUM_REFE ?? '';
  const activeClient = searchRefData[0]?.CVE_IMPO ?? '';
  const { data: refCuenta } = useSWR(
    activeReference ? `/pyapi/gestor/refCuenta?ref=${activeReference}` : null,
    axiosFetcher
  );

  return (
    <>
      <GestorSearchRef searchRefData={searchRefData} setSearchData={setSearchRefData} />

      {searchRefData.length > 0 && (
        <Card>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="font-semibold text-2xl">Subir archivo(s) al Gestor</p>
            </div>
            <GestorUploadFileDialog client={activeClient} reference={activeReference} />
            {refCuenta && (
              <GestorRefCuentaDataTable data={refCuenta} columns={gestorRefCuentaColumns} />
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
