'use client';

import React from "react";
import { MyGPDialog } from "../MyGPUI/Dialogs/MyGPDialog";
import { MyGPButtonPrimary } from "../MyGPUI/Buttons/MyGPButtonPrimary";
import { IconBallpenFilled } from "@tabler/icons-react";
import { GestorCuenta } from "@/types/gestor/GestorCuenta";
import { Row } from '@tanstack/react-table';
import GestorUploadFiles from "./GestorUploadFiles";

export default function GestorCuentaDialog({ row }: { row: Row<GestorCuenta> }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <MyGPDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <MyGPButtonPrimary>
            <IconBallpenFilled />
            <span>Modificar</span>
          </MyGPButtonPrimary>
        }
      >
        <GestorUploadFiles row={row} />
      </MyGPDialog>
    </div>
  )
}
