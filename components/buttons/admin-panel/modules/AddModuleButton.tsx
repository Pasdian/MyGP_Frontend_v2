'use client';

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
import { IconPlus } from '@tabler/icons-react';
import AddModuleForm from '@/components/forms/admin-panel/AddModuleForm';

export default function AddModuleButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4">
          <IconPlus stroke={2} />
          Añadir Modulo
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Modulo</DialogTitle>
          <DialogDescription>
            Aquí podrás añadir un nuevo modulo. Haz click en guardar cuando termines de editar los
            campos.
          </DialogDescription>
        </DialogHeader>
        {isOpen && <AddModuleForm setIsOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}
