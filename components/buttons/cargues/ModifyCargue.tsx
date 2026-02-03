'use client';

import React from 'react';
import { Row } from '@tanstack/react-table';
import { IconBallpenFilled } from '@tabler/icons-react';
import { ModifyCargueForm } from '@/components/forms/transbel/cargue/ModifyCargueForm';
import { getCargues } from '@/types/transbel/getCargues';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';

export default function ModifyCargue({ row }: { row: Row<getCargues> }) {
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <MyGPDialog
      open={openDialog}
      onOpenChange={setOpenDialog}
      trigger={
        <MyGPButtonWarning>
          <IconBallpenFilled />
          <span className="ml-1">Modificar</span>
        </MyGPButtonWarning>
      }
    >
      {openDialog && row && row.original.NUM_REFE && (
        <ModifyCargueForm
          NUM_REFE={row.original.NUM_REFE || ''}
          EE={row.original.EE || ''}
          GE={row.original.GE || ''}
          CECO={row.original.CECO || ''}
          CUENTA={row.original.CUENTA || ''}
        />
      )}
    </MyGPDialog>
  );
}
