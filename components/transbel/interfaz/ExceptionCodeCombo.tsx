'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exceptionCodes } from './exceptionCodes';
import { ControllerRenderProps } from 'react-hook-form';

export function ExceptionCodeCombo({
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
      CVE_ETAP: string;
    },
    'OBS_ETAP'
  >;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="bg-blue-400 hover:bg-blue-500">
          {field.value ? field.value : 'Código de Excepción'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Causa Global</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          {exceptionCodes.map((code) => {
            return (
              <DropdownMenuSub key={code.causaGlobal}>
                <DropdownMenuSubTrigger>{code.causaGlobal}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Filtrar..." autoFocus={true} className="h-9" />
                    <CommandList>
                      <CommandEmpty>No se encontro código de excepción.</CommandEmpty>
                      <CommandGroup>
                        {code.causaPuntual.map((causa) => (
                          <CommandItem
                            key={causa.value}
                            value={causa.value}
                            onSelect={(value) => {
                              field.onChange(value);
                              setOpen(false);
                            }}
                          >
                            {causa.value} - {causa.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
