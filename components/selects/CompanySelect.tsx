'use client';

import * as React from 'react';
import useSWRImmutable from 'swr';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type Props = {
  /** Controlled selection (array of UUIDs) */
  values?: string[];
  /** Uncontrolled initial selection */
  defaultValues?: string[];
  /** Called whenever selection changes */
  onValuesChange?(values: string[]): void;
  /** Trigger button label when nothing selected */
  placeholder?: string;
};

export default function CompanySelect({
  values,
  defaultValues = [],
  onValuesChange,
  placeholder = 'Seleccionar compañías',
}: Props) {
  const { data: companies, isLoading } = useSWRImmutable<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );
  const [open, setOpen] = React.useState(false);

  // controlled vs uncontrolled
  const isControlled = Array.isArray(values);
  const [internal, setInternal] = React.useState<string[]>(defaultValues);
  const selected = React.useMemo<string[]>(
    () => (isControlled ? values ?? [] : internal),
    [isControlled, values, internal]
  );

  // ----- scroll-preserving update -----
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const updatePreservingScroll = (next: string[]) => {
    const el = listRef.current;
    const top = el?.scrollTop ?? 0;
    if (!isControlled) setInternal(next);
    onValuesChange?.(next);
    // restore scroll next frame to avoid jump
    requestAnimationFrame(() => {
      if (el) el.scrollTop = top;
    });
  };

  // helpers
  const addUnique = (arr: string[], id: string) => (arr.includes(id) ? arr : [...arr, id]);
  const removeOne = (arr: string[], id: string) => arr.filter((x) => x !== id);

  const onCheckChange = (id: string) => (checked: boolean | 'indeterminate') => {
    if (!id) return;
    const isOn = checked === true;
    const next = isOn ? addUnique(selected, id) : removeOne(selected, id);
    updatePreservingScroll(next);
  };

  const isChecked = (id?: string | null) => !!id && selected.includes(id);

  // sort: checked first, then name (stable)
  const sortedCompanies = React.useMemo(() => {
    if (!companies) return [];
    return [...companies].sort((a, b) => {
      const aId = a.uuid ?? '';
      const bId = b.uuid ?? '';
      const aSel = selected.includes(aId);
      const bSel = selected.includes(bId);
      if (aSel !== bSel) return aSel ? -1 : 1;
      return (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
    });
  }, [companies, selected]);

  // button summary
  const summary = React.useMemo(() => {
    if (!companies || selected.length === 0) return placeholder;
    const byId = new Map(companies.map((c) => [c.uuid, c]));
    const names = selected.map((id) => byId.get(id)?.name ?? '').filter(Boolean);
    if (names.length === 0) return placeholder;
    const first = names[0];
    const rest = names.length - 1;
    return rest > 0 ? `${first} +${rest} más` : first;
  }, [companies, selected, placeholder]);

  // ----- loading / empty -----
  if (isLoading)
    return (
      <div className="flex items-center">
        <div className="mr-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Cargando compañías..." />
            </SelectTrigger>
          </Select>
        </div>
        <Loader2 className="w-5 animate-spin" />
      </div>
    );

  if (!companies || companies.length === 0)
    return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="No se encontró ninguna compañía" />
        </SelectTrigger>
      </Select>
    );

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        {summary}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar por nombre, ID o UUID..." />

        {/* Disable browser scroll anchoring & capture ref */}
        <CommandList ref={listRef} className="[overflow-anchor:none]">
          <CommandEmpty>No se encontró la compañía.</CommandEmpty>

          <CommandGroup heading="Compañías">
            {sortedCompanies.map((c) => {
              const uuid = c.uuid ?? '';
              const name = c.name ?? '';
              const filterValue = `${name} ${uuid}`.trim();

              return (
                <CommandItem
                  key={uuid}
                  value={filterValue}
                  className={[isChecked(uuid) ? 'bg-primary/5' : ''].join(' ')}
                >
                  <div
                    className="flex items-center w-full gap-3"
                    // prevent cmdk selection on inner interactions
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onKeyDownCapture={(e) => e.stopPropagation()}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium truncate">{name}</span>
                      <span className="text-xs text-muted-foreground truncate">UUID: {uuid}</span>
                    </div>

                    {/* Checkbox: only toggle source */}
                    <Checkbox
                      checked={isChecked(uuid)}
                      onCheckedChange={onCheckChange(uuid)}
                      className="ml-auto"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                      disabled={!uuid}
                    />
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>

        <div className="flex items-center justify-between px-3 py-2 border-t">
          <div className="text-xs text-muted-foreground">{selected.length} seleccionada(s)</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => updatePreservingScroll([])}>
              Limpiar
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Listo
            </Button>
          </div>
        </div>
      </CommandDialog>
    </div>
  );
}
