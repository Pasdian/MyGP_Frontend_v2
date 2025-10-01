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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconBug } from '@tabler/icons-react';
import { exceptionCodes } from '@/lib/exceptioncodes/exceptionCodes';

export default function ExceptionCodeCombo({
  onSelect,
  currentValue,
}: {
  onSelect: (value: string) => void;
  currentValue?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild>
    <Button
    size="sm"
    className="cursor-pointer bg-blue-400 hover:bg-blue-500"
    type="button"
    >
    <IconBug stroke={2} />
    {currentValue || 'Código de Excepción'}
    </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="p-0">
    {Object.entries(exceptionCodes).map(([responsable, causasGlobales]) => (
      <DropdownMenuSub key={responsable}>
      <DropdownMenuSubTrigger>{responsable}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent
      className="p-0 w-[280px] max-h-[300px] overflow-y-auto"
      >
      {Object.entries(causasGlobales).map(([causaGlobal, causasPuntuales]) => (
        <DropdownMenuSub key={causaGlobal}>
        <DropdownMenuSubTrigger>{causaGlobal}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent
        className="p-0 w-[560px] max-h-[300px] overflow-y-auto"
        >
        <Command>
        <CommandInput placeholder="Filtrar..." autoFocus className="h-9" />
        <CommandList>
        <CommandEmpty>No se encontró código de excepción.</CommandEmpty>
        <CommandGroup>
        {causasPuntuales.map((causa: string) => (
          <CommandItem
          key={causa}
          value={causa}
          onSelect={(val) => {
            onSelect(val.split(" ")[0]);
            setOpen(false);
          }}
          >
          {causa}
          </CommandItem>
        ))}
        </CommandGroup>
        </CommandList>
        </Command>
        </DropdownMenuSubContent>
        </DropdownMenuSub>
      ))}
      </DropdownMenuSubContent>
      </DropdownMenuSub>
    ))}
    </DropdownMenuContent>
    </DropdownMenu>
  );
}
