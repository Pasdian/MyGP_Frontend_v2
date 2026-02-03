'use client';

import AddUserForm from '@/components/forms/admin-panel/AddUserForm';
import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary';
import { MyGPDialog } from '@/components/MyGPUI/Dialogs/MyGPDialog';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

export default function AddUserButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <MyGPDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Añadir Usuario"
      description="Aquí podrás añadir un nuevo usuario. Haz click en guardar cuando termines de editar los campos."
      trigger={
        <MyGPButtonPrimary className="mb-4 w-[160px]">
          <IconPlus stroke={2} />
          <span className="ml-1">Añadir Usuario</span>
        </MyGPButtonPrimary>
      }
    >
      {isOpen && <AddUserForm setIsOpen={setIsOpen} />}
    </MyGPDialog>
  );
}
