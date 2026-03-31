'use client';

import React from 'react';
import { MyGPDialog } from '../MyGPUI/Dialogs/MyGPDialog';
import GestorUploadFiles from './GestorUploadFiles';
import { UploadIcon } from 'lucide-react';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';

type GestorUploadFileDialogProps = {
  client: string;
  reference: string;
  defaultFileCategory?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  disableCategorySelect?: boolean;
};

export default function GestorUploadFileDialog({
  client,
  reference,
  defaultFileCategory = '',
  triggerLabel = 'Subir Archivo',
  triggerClassName = 'h-10',
  disableCategorySelect = false, // Default to false
}: GestorUploadFileDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <MyGPDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Subir archivo al Gestor"
        description="Aquí podrás subir archivos al gestor para la referencia consultada."
        trigger={
          <MyGPButtonPrimary className={triggerClassName}>
            <UploadIcon />
            <span>{triggerLabel}</span>
          </MyGPButtonPrimary>
        }
      >
        <GestorUploadFiles
          client={client}
          reference={reference}
          defaultFileCategory={defaultFileCategory}
          disableCategorySelect={disableCategorySelect}
        />
      </MyGPDialog>
    </div>
  );
}
