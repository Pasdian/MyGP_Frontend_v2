import { GPClient } from '@/axios-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllUsersDeepCopy } from '@/types/users/getAllUsers';
import { DialogClose } from '@radix-ui/react-dialog';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';
import { mutate } from 'swr';

export default function DeleteUserButton({
  row,
  open,
  setIsOpen,
}: {
  row: Row<getAllUsersDeepCopy>;
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  async function deleteUser() {
    await GPClient.delete(`/api/users/deleteUser/${row.original.user_uuid}`)
      .then((res) => {
        toast.success(res.data.message);
        mutate('/api/users/getAllUsers');
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="md:max-w-[500px] md:max-h-[600px] md:rounded-lg rounded-none max-h-full max-w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogDescription>
            Aquí podrás realizar la eliminación de un usuario. Haz click en aceptar si estás seguro
            de eliminar un usuario
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            className="cursor-pointer bg-red-500 hover:bg-red-600"
            onClick={() => deleteUser()}
          >
            Eliminar Usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
