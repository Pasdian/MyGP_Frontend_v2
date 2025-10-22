'use client';

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import InterfaceUpsertPhaseForm from '@/components/forms/transbel/interface/InterfaceUpsertPhaseForm';
import InterfaceUpdateFolioForm from '@/components/forms/transbel/interface/InterfaceUpdateFolioForm';
const TAB_VALUES = ['phase', 'folio'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(v: string): v is TabValue {
  return (TAB_VALUES as readonly string[]).includes(v);
}

export default function InterfaceUpsertPhaseButton({ row }: { row: Row<getRefsPendingCE> }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [tabValue, setTabValue] = React.useState<'phase' | 'folio'>('phase');
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-yellow-400 hover:bg-yellow-500">
          <IconBallpenFilled />
          Modificar
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogTitle hidden>Title</DialogTitle>
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
        </DialogHeader>

        {openDialog && row && tabValue !== 'folio' && (
          <InterfaceUpsertPhaseForm row={row} setOpenDialog={setOpenDialog} />
        )}
        {openDialog && row && tabValue == 'folio' && row.original.REFERENCIA && (
          <InterfaceUpdateFolioForm row={row} setOpenDialog={setOpenDialog} />
        )}
      </DialogContent>
    </Dialog>
  );
}
