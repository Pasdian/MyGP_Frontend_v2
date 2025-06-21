'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ControllerRenderProps } from 'react-hook-form';

export function ExceptionCodeDropdown({
  field,
}: {
  field: ControllerRenderProps<
    {
      REFERENCIA: string;
      CE_140: string;
      HOR_ETAP: string;
      FEC_ETAP: string;
      OBS_ETAP: string;
      CVE_MODI: string;
      PHASE: string;
    },
    'OBS_ETAP'
  >;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Selecciona una código de excepción</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Etapas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={field.value} onValueChange={field.onChange}>
          <DropdownMenuRadioItem value="138">138 - Entrega a Transporte</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="140">140 - Entrega a CDP</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
