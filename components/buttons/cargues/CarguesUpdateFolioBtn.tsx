'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import CarguesUpdateFolioForm from '@/components/forms/transbel/interface/CarguesUpdateFolioForm';
import { getCargues } from '@/types/transbel/getCargues';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { MyGPButtonWarning } from '@/components/MyGPUI/Buttons/MyGPButtonWarning';
export default function CarguesUpdateFolioBtn({ row }: { row: Row<getCargues> }) {
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
        <CarguesUpdateFolioForm row={row} setOpenDialog={setOpenDialog} />
      )}
    </MyGPDialog>
  );
}
