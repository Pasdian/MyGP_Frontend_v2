'use client';

import AddUserForm from '@/components/forms/admin-panel/AddUserForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';

export default function AddUserButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4">
          <IconPlus stroke={2} />
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
        <AddUserForm setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
