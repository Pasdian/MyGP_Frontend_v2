'use client';

import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { useCompanies } from '@/hooks/useCompanies';
import React from 'react';
import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { DocumentosComercialMain } from '@/components/expediente-digital-cliente/main/DocumentosComercialMain';
import { DocumentosComplementariosMain } from '@/components/expediente-digital-cliente/main/DocumentosComplementariosMain';
import { DocumentosVulnerablesMain } from '@/components/expediente-digital-cliente/main/DocumentosVulnerablesMain';

export default function ExpedienteDigitalCliente() {
  const [client, setClient] = React.useState('');
  const { rows: companies, loading: isCompaniesLoading } = useCompanies();

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  return (
    <div>
      <p className="text-2xl font-bold mb-4">Lista de Documentos - Persona Moral</p>
      <div className="w-72 mb-4">
        <MyGPCombo
          placeholder="Selecciona un cliente"
          value={client}
          setValue={setClient}
          options={companiesOptions}
          label="Selecciona un cliente"
          showValue
        />
      </div>
      <DocumentosImportadorMain />
      <DocumentosComercialMain />
      <DocumentosComplementariosMain />
      <DocumentosVulnerablesMain />
    </div>
  );
}
