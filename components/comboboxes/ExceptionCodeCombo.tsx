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
import { exceptionCodes } from '@/lib/exceptioncodes/exceptionCodes';

export function ExceptionCodeCombo({
  onSelect,
  currentValue,
}: {
  onSelect: (value: string) => void;
  currentValue: string | undefined;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={() => setOpen((opened) => !opened)}
          size="sm"
          className="cursor-pointer bg-blue-400 hover:bg-blue-500"
          type="button"
        >
          {currentValue ? currentValue : 'Código de Excepción'}
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
                            onSelect={(val) => {
                              onSelect(val);
                              setOpen((opened) => !opened);
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
