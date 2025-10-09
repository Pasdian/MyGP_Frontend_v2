'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { getRefsPendingCEFormat } from '@/types/transbel/getRefsPendingCE';
import InterfaceUpsertPhaseForm from '@/components/forms/transbel/interface/InterfaceUpsertPhaseForm';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import InterfaceUpsertFolioForm from '@/components/forms/transbel/interface/InterfaceUpsertFolioForm';
import useSWRImmutable from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { FolioData } from '@/types/transbel/folioData';
const TAB_VALUES = ['phase', 'folio'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}
export default function InterfaceUpsertPhaseButton({ row }: { row: Row<getRefsPendingCEFormat> }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState<'phase' | 'folio'>('phase');
  const folioKey =
    row.original.REFERENCIA &&
    tabValue == 'folio' &&
    `/api/transbel/datosEmbarque?reference=${row.original.REFERENCIA}`;

  const { data: folioData, isLoading: isFolioDataLoading } = useSWRImmutable<FolioData>(
    folioKey,
    axiosFetcher
  );

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-yellow-400 hover:bg-yellow-500">
          <IconBallpenFilled />
          Modificar
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <Tabs
            value={tabValue}
            onValueChange={(v) => isTabValue(v) && setTabValue(v)}
            className="mb-2"
          >
            <TabsList>
              <TabsTrigger value="phase">Modificar Referencia</TabsTrigger>
              <TabsTrigger value="folio">Modificar Folio</TabsTrigger>
            </TabsList>
          </Tabs>
          <DialogTitle>{`Editar ${tabValue == 'folio' ? 'Folio' : 'Entrega'} - ${
            row.original.REFERENCIA
          }`}</DialogTitle>
          <DialogDescription>
            {tabValue == 'folio'
              ? 'Aquí podrás realizar la modificación del folio de una referencia. Haz click en guardar cuando termines de editar los campos.'
              : 'Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando termines de editar los campos.'}
          </DialogDescription>
        </DialogHeader>

        {openDialog && row && tabValue !== 'folio' && (
          <InterfaceUpsertPhaseForm row={row} setOpenDialog={setOpenDialog} />
        )}
        {!isFolioDataLoading && openDialog && row && tabValue == 'folio' && folioData && (
          <InterfaceUpsertFolioForm
            row={row}
            setOpenDialog={setOpenDialog}
            folioRows={folioData.data}
          />
        )}
        {!isFolioDataLoading && !folioData && tabValue == 'folio' && <p>No existen datos.</p>}
      </DialogContent>
    </Dialog>
  );
}
