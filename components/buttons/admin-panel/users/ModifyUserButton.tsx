import ModifyUserForm from '@/components/forms/admin-panel/ModifyUserForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dropdownModifyClassName } from '@/lib/classNames/adminActions';
import { getAllUsers } from '@/types/users/getAllUsers';
import { Row } from '@tanstack/react-table';
import React from 'react';

export default function ModifyUserButton({
  row,
  open,
  setIsOpen,
}: {
  row: Row<getAllUsers>;
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger className={`${dropdownModifyClassName} mb-1`}>
        <span className="text-sm text-white font-bold">Modificar</span>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de un usuario. Haz click en guardar
            cuando termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        {open && <ModifyUserForm row={row} />}
      </DialogContent>
    </Dialog>
  );
}
