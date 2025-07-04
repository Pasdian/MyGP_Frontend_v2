import AdminPanelModifyUserForm from '@/components/forms/admin-panel/AdminPanelModifyUserForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getAllUsers } from '@/types/users/getAllUsers';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Row } from '@tanstack/react-table';

export default function AdminPanelModifyUserButton({ row }: { row: Row<getAllUsers> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p>Modificar Usuario</p>
      </DialogTrigger>
      <DropdownMenuItem>
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
      </DropdownMenuItem>
    </Dialog>
  );
}
