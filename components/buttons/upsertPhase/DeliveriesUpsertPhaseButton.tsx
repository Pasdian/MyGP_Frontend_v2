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

import { getDeliveries } from '@/types/transbel/getDeliveries';

import { DialogTrigger } from '@radix-ui/react-dialog';
import DeliveriesUpsertPhaseForm from '@/components/forms/transbel/deliveries/DeliveriesUpsertPhaseForm';
import { IconBallpenFilled } from '@tabler/icons-react';

export const UpdatePhaseRowContext = React.createContext<Row<getDeliveries> | undefined>(undefined);

export default function DeliveriesUpsertPhaseButton({ row }: { row: Row<getDeliveries> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-yellow-400 hover:bg-yellow-500">
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
        {isOpen && row && <DeliveriesUpsertPhaseForm row={row} />}
      </DialogContent>
    </Dialog>
  );
}
