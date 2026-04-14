'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import DeliveriesUpsertPhaseForm from '@/components/forms/transbel/deliveries/DeliveriesUpsertPhaseForm';
import { IconBallpenFilled, IconUpload } from '@tabler/icons-react';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';

export const UpdatePhaseRowContext = React.createContext<Row<getDeliveries> | undefined>(undefined);

export default function DeliveriesUpsertPhaseButton({
  row,
  uploadOnly = false,
}: {
  row: Row<getDeliveries>;
  uploadOnly?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={uploadOnly ? 'Subir archivo' : 'Editar Entrega'}
      description={
        uploadOnly
          ? 'Aquí podrás subir archivos de la entrega. La fecha de Entrega a CDP y el Código de Excepción se completan automáticamente.'
          : 'Aquí podrás realizar la modificación de una entrega. Haz click en guardar cuando termines de editar los campos.'
      }
      trigger={
        uploadOnly ? (
          <MyGPButtonPrimary>
            <IconUpload />
            <span>Subir Archivo(s)</span>
          </MyGPButtonPrimary>
        ) : (
          <MyGPButtonWarning>
            <IconBallpenFilled />
            <span>Modificar</span>
          </MyGPButtonWarning>
        )
      }
    >
      {/* Dialog content */}
      {isOpen && row && (
        <DeliveriesUpsertPhaseForm
          key={`${row.id}-${uploadOnly ? 'upload-only' : 'editable'}`}
          row={row}
          uploadOnly={uploadOnly}
        />
      )}
    </MyGPDialog>
  );
}
