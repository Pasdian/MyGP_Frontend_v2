import AdminPanelModifyRoleForm from '@/components/forms/admin-panel/AdminPanelModifyRoleForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getRoles } from '@/types/roles/getRoles';

import { Row } from '@tanstack/react-table';
import React from 'react';

export default function AdminPanelModifyRoleButton({ row }: { row: Row<getRoles> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <p>Modificar</p>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Rol</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de un rol. Haz click en guardar cuando
            termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        <AdminPanelModifyRoleForm row={row} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
