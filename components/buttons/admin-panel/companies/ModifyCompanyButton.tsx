import ModifyCompanyForm from '@/components/forms/admin-panel/ModifyCompanyForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dropdownModifyClassName } from '@/lib/classNames/adminActions';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { Row } from '@tanstack/react-table';
import React from 'react';

export default function ModifyCompanyButton({ row }: { row: Row<getAllCompanies> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={dropdownModifyClassName}>
        <span className="text-sm text-white">Modificar</span>
      </DialogTrigger>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Compañia</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la modificación de los datos de una compañia. Haz click en guardar
            cuando termines de editar los campos.
          </DialogDescription>
        </DialogHeader>
        {isOpen && row && <ModifyCompanyForm row={row} setIsOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}
