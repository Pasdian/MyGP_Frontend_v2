'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import React from 'react';
import { Row } from '@tanstack/react-table';
import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import { getCarguesFormat } from '@/types/transbel/getCargues';
import CarguesUpdateFolioForm from '@/components/forms/transbel/interface/CarguesUpdateFolioForm';
export default function CarguesUpdateFolioBtn({ row }: { row: Row<getCarguesFormat> }) {
  const [openDialog, setOpenDialog] = React.useState(false);

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

        {openDialog && row && row.original.NUM_REFE && (
          <CarguesUpdateFolioForm row={row} setOpenDialog={setOpenDialog} />
        )}
      </DialogContent>
    </Dialog>
  );
}
