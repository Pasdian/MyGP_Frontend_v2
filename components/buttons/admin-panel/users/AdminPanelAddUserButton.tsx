'use client';

import AdminPanelAddUserForm from '@/components/forms/admin-panel/AdminPanelAddUserForm';
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

export default function AdminPanelAddUserButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 5l0 14" />
            <path d="M5 12l14 0" />
          </svg>{' '}
          Añadir Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Usuario</DialogTitle>
          <DialogDescription>
            Aquí podrás añadir un nuevo usuario. Haz click en guardar cuando termines de editar los
            campos.
          </DialogDescription>
        </DialogHeader>
        <AdminPanelAddUserForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
