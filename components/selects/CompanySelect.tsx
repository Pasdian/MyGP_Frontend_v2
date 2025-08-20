'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import React from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';

export default function CompanySelect({
  onValueChange,
  defaultValue = '',
}: {
  onValueChange?(value: string): void;
  defaultValue?: string;
}) {
  const { data: companies, isLoading: isCompaniesLoading } = useSWR<getAllCompanies[]>(
    '/api/companies/getAllCompanies',
    axiosFetcher
  );
  if (isCompaniesLoading)
    return (
      <div className="flex items-center">
        <div className="mr-2">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Cargando compañias..." />
            </SelectTrigger>
          </Select>
        </div>
        <Loader2 className="w-5 animate-spin" />
      </div>
    );
  if (!companies)
    return (
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="No se encontró ninguna compañia" />
        </SelectTrigger>
      </Select>
    );

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona una compañia..." />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => {
          return (
            <div key={company.uuid}>
              <SelectItem value={company.uuid || ''}>
                {company.id} - {company.name}
              </SelectItem>
            </div>
          );
        })}
      </SelectContent>
    </Select>
  );
}
