'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import DeliveriesUpsertPhaseForm from '@/components/forms/transbel/deliveries/DeliveriesUpsertPhaseForm';
import { IconBallpenFilled } from '@tabler/icons-react';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';

export const UpdatePhaseRowContext = React.createContext<Row<getDeliveries> | undefined>(undefined);

export default function DeliveriesUpsertPhaseButton({ row }: { row: Row<getDeliveries> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Editar Entrega"
      description="Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando termines de editar los campos."
      trigger={
        <MyGPButtonWarning>
          <IconBallpenFilled />
          <span>Modificar</span>
        </MyGPButtonWarning>
      }
    >
      {/* Dialog content */}
      {isOpen && row && <DeliveriesUpsertPhaseForm row={row} />}
    </MyGPDialog>
  );
}
