'use client';

import React from 'react';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import { GestorCuenta } from '@/types/gestor/GestorCuenta';
import { Row } from '@tanstack/react-table';
import GestorUploadFiles from './GestorUploadFiles';
import { MyGPButtonWarning } from '../MyGPUI/Buttons/MyGPButtonWarning';

export default function GestorCuentaDialog({ row }: { row: Row<GestorCuenta> }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <MyGPDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <MyGPButtonWarning>
            <IconBallpenFilled />
            <span>Modificar</span>
          </MyGPButtonWarning>
        }
      >
        <GestorUploadFiles row={row} />
      </MyGPDialog>
    </div>
  );
}
