import ModifyModuleForm from '@/components/forms/admin-panel/ModifyModuleForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dropdownModifyClassName } from '@/lib/classNames/adminActions';
import { getAllModules } from '@/types/getAllModules/getAllModules';
import { Row } from '@tanstack/react-table';
import React from 'react';

export default function ModifyModuleButton({ row }: { row: Row<getAllModules> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={dropdownModifyClassName}>
        <span className="text-sm text-white">Modificar</span>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de un modulo. Haz click en guardar
            cuando termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        {isOpen && row && <ModifyModuleForm row={row} setIsOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}
