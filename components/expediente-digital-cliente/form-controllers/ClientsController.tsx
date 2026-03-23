import * as React from 'react';
import useSWR from 'swr';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';

type Company = {
  CVE_IMP: string;
  NOM_IMP: string;
};

type Option = {
  value: string;
  label: string;
};

type ClientsControllerProps<T extends FieldValues> = {
  control: Control<T>;
  name?: Path<T>;
  label?: string;
  placeholder?: string;
  isModal?: boolean;
  showValue?: boolean;
};

export function ClientsController<T extends FieldValues>({
  control,
  name = 'client' as Path<T>,
  label = 'Cliente:',
  placeholder = 'Selecciona un cliente',
  isModal = false,
  showValue = true,
}: ClientsControllerProps<T>) {
  const { data: companiesData, isLoading: isCompaniesLoading } = useSWR<Company[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );

  const companiesOptions = React.useMemo<Option[]>(() => {
    if (!companiesData) return [];

    return companiesData.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companiesData]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <MyGPCombo
          id={String(name)}
          value={field.value}
          setValue={field.onChange}
          label={label}
          options={companiesOptions}
          placeholder={placeholder}
          isModal={isModal}
          isLoading={isCompaniesLoading}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          aria-invalid={!!fieldState.error}
          aria-errormessage={fieldState.error ? `${String(name)}-error` : undefined}
          showValue={showValue}
        />
      )}
    />
  );
}
