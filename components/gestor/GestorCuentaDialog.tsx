'use client';

import React from 'react';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import { IconBallpenFilled } from '@tabler/icons-react';
import GestorUploadFiles from './GestorUploadFiles';
import { MyGPButtonWarning } from '../MyGPUI/Buttons/MyGPButtonWarning';
import { UploadIcon } from 'lucide-react';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';

export default function GestorCuentaDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <MyGPDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Modificar"
        description="Aquí podrás subir archivos al gestor para la referencia consultada."
        trigger={
          <MyGPButtonPrimary className="h-10">
            <UploadIcon />
            <span>Subir Archivo</span>
          </MyGPButtonPrimary>
        }
      >
        <GestorUploadFiles />
      </MyGPDialog>
    </div>
  );
}
