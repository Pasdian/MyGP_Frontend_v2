'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import React from 'react';
import DeliveriesAddPhaseForm from '@/components/forms/DeliveriesAddPhaseForm';

export default function DeliveriesAddPhaseButton() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div>
      <Button
        className="cursor-pointer bg-blue-400 hover:bg-blue-500 mb-4"
        onClick={() => setIsDialogOpen(true)}
      >
        Añadir Entrega
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:max-w-[500px] md:max-h-[600px] rounded-lg max-h-full max-w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Entrega</DialogTitle>
            <DialogDescription>
              Aquí podrás añadir una entrega. Haz click en guardar cuando termines de escribir en
              los campos.
            </DialogDescription>
          </DialogHeader>
          <DeliveriesAddPhaseForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
