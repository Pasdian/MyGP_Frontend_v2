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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="icon icon-tabler icons-tabler-filled icon-tabler-bug"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 4a4 4 0 0 1 3.995 3.8l.005 .2a1 1 0 0 1 .428 .096l3.033 -1.938a1 1 0 1 1 1.078 1.684l-3.015 1.931a7.17 7.17 0 0 1 .476 2.227h3a1 1 0 0 1 0 2h-3v1a6.01 6.01 0 0 1 -.195 1.525l2.708 1.616a1 1 0 1 1 -1.026 1.718l-2.514 -1.501a6.002 6.002 0 0 1 -3.973 2.56v-5.918a1 1 0 0 0 -2 0v5.917a6.002 6.002 0 0 1 -3.973 -2.56l-2.514 1.503a1 1 0 1 1 -1.026 -1.718l2.708 -1.616a6.01 6.01 0 0 1 -.195 -1.526v-1h-3a1 1 0 0 1 0 -2h3.001v-.055a7 7 0 0 1 .474 -2.173l-3.014 -1.93a1 1 0 1 1 1.078 -1.684l3.032 1.939l.024 -.012l.068 -.027l.019 -.005l.016 -.006l.032 -.008l.04 -.013l.034 -.007l.034 -.004l.045 -.008l.015 -.001l.015 -.002l.087 -.004a4 4 0 0 1 4 -4zm0 2a2 2 0 0 0 -2 2h4a2 2 0 0 0 -2 -2z" />
          </svg>{' '}
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
