import ModifyRoleForm from '@/components/forms/admin-panel/ModifyRoleForm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dropdownModifyClassName } from '@/lib/classNames/adminActions';
import { getAllRoles } from '@/types/roles/getAllRoles';

import { Row } from '@tanstack/react-table';
import React from 'react';

export default function ModifyRoleButton({ row }: { row: Row<getAllRoles> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={dropdownModifyClassName}>
        <span className="text-sm text-white font-bold">Modificar</span>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Rol</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de un rol. Haz click en guardar cuando
            termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        {isOpen && <ModifyRoleForm row={row} setIsOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}
