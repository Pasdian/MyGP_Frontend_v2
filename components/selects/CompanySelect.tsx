'use client';
import React, { useMemo, useState, useEffect, useRef } from 'react';
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
import { cn } from '@/lib/utils';

type CompanySelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value'
> & {
  value: string[];
  onChange: (v: string[]) => void;
  showSelection?: boolean;
  className?: string;
  placeHolder?: React.ReactNode | string;
};

export default function CompanySelect({
  value,
  onChange,
  showSelection,
  className,
  placeHolder,
  ...props
}: CompanySelectProps) {
  const { data: companies, isLoading } = useSWR<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // close on outside click and Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selected = useMemo(
    () => (companies ?? []).filter((c) => value.includes(String(c.CVE_IMP))),
    [companies, value]
  );

  const unselected = useMemo(
    () => (companies ?? []).filter((c) => !value.includes(String(c.CVE_IMP))),
    [companies, value]
  );

  useEffect(() => {
    localStorage.setItem('dea-user-companies', JSON.stringify(value));
  }, [value]);

  const checkboxProps = (id: string, checked: boolean) => ({
    checked,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      toggle(id);
    },
    onClick: (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation(),
    className: 'flex-shrink-0',
  });
  const isReady = !isLoading && companies;
  return (
    <div ref={rootRef} className="relative w-full">
      <div className="flex items-center">
        <MyGPButtonPrimary
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn('border rounded-md flex-1 px-2', className)}
          {...props}
        >
          {placeHolder ??
            `Seleccionar compañías (${value.length} seleccionada${value.length === 1 ? '' : 's'})`}
        </MyGPButtonPrimary>
      </div>

      {showSelection && selected.length > 0 && (
        <div className="flex flex-wrap mb-3 gap-2">
          {selected.map((c) => {
            const id = String(c.CVE_IMP);
            return (
              <span
                key={`chip-${id}`}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs bg-white"
                title={`${id} - ${c.NOM_IMP}`}
              >
                {id} - {c.NOM_IMP}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-2 text-gray-500 hover:text-gray-800"
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

      {isReady && open && (
        <div className="absolute left-0 top-full mt-1 w-[400px] h-[300px] border rounded bg-white shadow-md overflow-hidden z-50">
          <Command className="rounded-lg h-full">
            <CommandInput placeholder="Buscar por clave o nombre..." />
            <CommandList className="h-full overflow-y-auto">
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
                          className="truncate max-w-[230px] sm:max-w-[300px] text-xs text-gray-800"
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
                        className="truncate max-w-[230px] sm:max-w-[300px] text-xs text-gray-800"
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
