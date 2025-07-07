import AdminPanelModifyUserForm from '@/components/forms/admin-panel/AdminPanelModifyUserForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllUsersDeepCopy } from '@/types/users/getAllUsers';
import { Row } from '@tanstack/react-table';
import React from 'react';

export default function AdminPanelModifyUserButton({
  row,
  open,
  setIsOpen,
}: {
  row: Row<getAllUsersDeepCopy>;
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de un usuario. Haz click en guardar
            cuando termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        <AdminPanelModifyUserForm row={row} />
      </DialogContent>
    </Dialog>
  );
}
