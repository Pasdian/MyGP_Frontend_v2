'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React from 'react';
import AdminPanelAddRoleForm from '@/components/forms/admin-panel/AdminPanelAddRoleForm';

export default function AdminPanelAddRoleButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4">
          <FontAwesomeIcon icon={faAdd} />
          Añadir Rol
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Rol</DialogTitle>
          <DialogDescription>
            Aquí podrás añadir un nuevo rol. Haz click en guardar cuando termines de editar los
            campos.
          </DialogDescription>
        </DialogHeader>
        <AdminPanelAddRoleForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
