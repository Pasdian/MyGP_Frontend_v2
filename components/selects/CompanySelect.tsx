'use client';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';

export default function CompanySelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { data: companies, isLoading } = useSWR<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const clearAll = () => onChange([]);

  const selected = useMemo(
    () => (companies ?? []).filter((c) => value.includes(String(c.CVE_IMP))),
    [companies, value]
  );

  const unselected = useMemo(
    () => (companies ?? []).filter((c) => !value.includes(String(c.CVE_IMP))),
    [companies, value]
  );

  if (isLoading) return <p>Loading companies...</p>;

  // Reusable checkbox props to avoid double toggle on row + checkbox
  const checkboxProps = (id: string, checked: boolean) => ({
    checked,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      toggle(id);
    },
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
      // Some browsers fire click after change; guard to avoid bubbling
      e.stopPropagation();
    },
    className: 'flex-shrink-0',
  });

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <MyGPButtonPrimary onClick={() => setOpen((o) => !o)} className="border p-2 rounded">
          Seleccionar compañías ({value.length} seleccionada{value.length === 1 ? '' : 's'})
        </MyGPButtonPrimary>
        {value.length > 0 && <MyGPButtonPrimary onClick={clearAll}>Limpiar</MyGPButtonPrimary>}
      </div>

      {selected.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {selected.map((c) => {
            const id = String(c.CVE_IMP);
            return (
              <span
                key={`chip-${id}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-white"
                title={`${id} - ${c.NOM_IMP}`}
              >
                {id} - {c.NOM_IMP}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label={`Quitar ${id}`}
                  title="Quitar"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="border rounded mt-2 bg-white shadow-md">
          <Command className="rounded-lg">
            <CommandInput placeholder="Buscar por clave o nombre..." />
            <CommandList className="max-h-[340px] overflow-y-auto">
              <CommandEmpty>No se encontraron compañías.</CommandEmpty>

              {selected.length > 0 && (
                <CommandGroup heading="Seleccionadas">
                  {selected.map((c) => {
                    const id = String(c.CVE_IMP);
                    const label = `${id} - ${c.NOM_IMP}`;
                    return (
                      <CommandItem
                        key={`sel-${id}`}
                        value={`${id} ${c.NOM_IMP}`}
                        onSelect={() => toggle(id)}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          {...checkboxProps(id, true)}
                          aria-label={`Deseleccionar ${label}`}
                        />
                        <span
                          title={label}
                          className="truncate max-w-[230px] sm:max-w-[300px] text-sm text-gray-800"
                        >
                          {label}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              <CommandGroup heading="Todas">
                {unselected.map((c) => {
                  const id = String(c.CVE_IMP);
                  const label = `${id} - ${c.NOM_IMP}`;
                  const isChecked = value.includes(id);
                  return (
                    <CommandItem
                      key={`${c.CVE_IMP}-${c.NOM_IMP}`}
                      value={`${id} ${c.NOM_IMP}`}
                      onSelect={() => toggle(id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        {...checkboxProps(id, isChecked)}
                        aria-label={`${isChecked ? 'Deseleccionar' : 'Seleccionar'} ${label}`}
                      />
                      <span
                        title={label}
                        className="truncate max-w-[230px] sm:max-w-[300px] text-sm text-gray-800"
                      >
                        {label}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
