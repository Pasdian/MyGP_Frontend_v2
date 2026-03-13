'use client';

import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr/immutable';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { cn } from '@/lib/utils';
import { MyGPComboMulti } from '../MyGPUI/Combobox/MyGPComboMulti';

type CompanySelectProps = {
  value: string[];
  onChange: (v: string[]) => void;
  showSelection?: boolean;
  className?: string;
  placeHolder?: string;
};

export default function CompanySelect({
  value,
  onChange,
  showSelection,
  className,
  placeHolder,
}: CompanySelectProps) {
  const { data: companies, isLoading } = useSWR<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );

  useEffect(() => {
    localStorage.setItem('dea-user-companies', JSON.stringify(value));
  }, [value]);

  const options = useMemo(
    () =>
      (companies ?? []).map((c) => {
        const companyValue = String(c.CVE_IMP);
        return {
          value: companyValue,
          label: c.NOM_IMP ?? companyValue,
        };
      }),
    [companies]
  );

  const selected = useMemo(
    () => (companies ?? []).filter((c) => value.includes(String(c.CVE_IMP))),
    [companies, value]
  );

  const setValues: React.Dispatch<React.SetStateAction<string[]>> = (updater) => {
    const nextValue = typeof updater === 'function' ? updater(value) : updater;
    onChange(nextValue);
  };

  return (
    <div className="w-full">
      <MyGPComboMulti
        values={value}
        setValues={setValues}
        options={options}
        placeholder={
          placeHolder ??
          `Seleccionar compañías (${value.length} seleccionada${value.length === 1 ? '' : 's'})`
        }
        showValue
        className={cn('w-full', className)}
      />

      {showSelection && selected.length > 0 && !isLoading && (
        <div className="flex flex-wrap mt-3 gap-2">
          {selected.map((c) => {
            const id = String(c.CVE_IMP);
            const name = c.NOM_IMP ?? id;

            return (
              <span
                key={`chip-${id}`}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs bg-white"
                title={`${id} - ${name}`}
              >
                {id} - {name}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== id))}
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
    </div>
  );
}
