'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

import React from 'react';
import { Row } from '@tanstack/react-table';

import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import InterfaceUpsertPhaseForm from '@/components/forms/transbel/interface/InterfaceUpsertPhaseForm';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { IconBallpenFilled } from '@tabler/icons-react';

export default function InterfaceUpsertPhaseButton({ row }: { row: Row<getRefsPendingCE> }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpenDialog((opened) => !opened)}
          className="cursor-pointer bg-yellow-400 hover:bg-yellow-500"
        >
          <IconBallpenFilled />
          Modificar
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entrega</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando
            termines de editar los campos.
          </DialogDescription>
        </DialogHeader>

        <InterfaceUpsertPhaseForm row={row} setOpenDialog={setOpenDialog} />
      </DialogContent>
    </Dialog>
  );
}
