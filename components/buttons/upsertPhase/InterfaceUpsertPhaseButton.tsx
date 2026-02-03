'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { getRefsPendingCE } from '@/types/transbel/getRefsPendingCE';
import { IconBallpenFilled } from '@tabler/icons-react';
import InterfaceUpsertPhaseForm from '@/components/forms/transbel/interface/InterfaceUpsertPhaseForm';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';

export default function InterfaceUpsertPhaseButton({ row }: { row: Row<getRefsPendingCE> }) {
  const [openDialog, setOpenDialog] = React.useState(false);
  return (
    <MyGPDialog
      open={openDialog}
      onOpenChange={setOpenDialog}
      trigger={
        <MyGPButtonWarning>
          <IconBallpenFilled />
          <span>Modificar</span>
        </MyGPButtonWarning>
      }
    >
      <InterfaceUpsertPhaseForm row={row} setOpenDialog={setOpenDialog} />
    </MyGPDialog>
  );
}
