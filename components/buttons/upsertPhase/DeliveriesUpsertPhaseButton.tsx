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
import DeliveriesUpsertPhaseForm from '@/components/forms/transbel/DeliveriesUpsertPhaseForm';

export const UpdatePhaseRowContext = React.createContext<Row<getDeliveries> | undefined>(undefined);

export default function DeliveriesUpsertPhaseButton({ row }: { row: Row<getDeliveries> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-yellow-400 hover:bg-yellow-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="icon icon-tabler icons-tabler-filled icon-tabler-ballpen"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M17.828 2a3 3 0 0 1 1.977 .743l.145 .136l1.171 1.17a3 3 0 0 1 .136 4.1l-.136 .144l-1.706 1.707l2.292 2.293a1 1 0 0 1 .083 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.497 -1.32l.083 -.094l3.292 -3.293l-1.586 -1.585l-7.464 7.464a3.828 3.828 0 0 1 -2.474 1.114l-.233 .008c-.674 0 -1.33 -.178 -1.905 -.508l-1.216 1.214a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.214 -1.216a3.828 3.828 0 0 1 .454 -4.442l.16 -.17l10.586 -10.586a3 3 0 0 1 1.923 -.873l.198 -.006zm0 2a1 1 0 0 0 -.608 .206l-.099 .087l-1.707 1.707l2.586 2.585l1.707 -1.706a1 1 0 0 0 .284 -.576l.01 -.131a1 1 0 0 0 -.207 -.609l-.087 -.099l-1.171 -1.171a1 1 0 0 0 -.708 -.293z" />
          </svg>{' '}
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
        <DeliveriesUpsertPhaseForm row={row} />
      </DialogContent>
    </Dialog>
  );
}
