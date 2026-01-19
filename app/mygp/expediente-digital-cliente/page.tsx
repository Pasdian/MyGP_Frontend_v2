'use client';

import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo';
import { useCompanies } from '@/hooks/useCompanies';
import React from 'react';
import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { DocumentosComercialMain } from '@/components/expediente-digital-cliente/main/DocumentosComercialMain';
import { DocumentosComplementariosMain } from '@/components/expediente-digital-cliente/main/DocumentosComplementariosMain';
import { DocumentosVulnerablesMain } from '@/components/expediente-digital-cliente/main/DocumentosVulnerablesMain';
import { ClienteProvider, useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

function Content() {
  const { cliente, setCliente } = useCliente();
  const [clientValue, setClientValue] = React.useState('');
  const { rows: companies } = useCompanies();

  const companiesOptions = React.useMemo(() => {
    return companies.map((company) => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP,
    }));
  }, [companies]);

  const handleChange = (value: string) => {
    setClientValue(value);
    const selected = companiesOptions.find((o) => o.value === value);
    if (selected) {
      setCliente(`${selected.value} ${selected.label}`);
    }
  };

  return (
    <div>
      <p className="text-2xl font-bold mb-4">Lista de Documentos - Persona Moral</p>
      <div className="w-72 mb-4">
        <div className="mb-2">
          <MyGPCombo
            placeholder="Selecciona un cliente"
            value={clientValue}
            setValue={handleChange}
            options={companiesOptions}
            label="Selecciona un cliente"
            showValue
          />
        </div>
        {!clientValue && <p className="text-sm text-red-600">Por favor selecciona un cliente</p>}
      </div>
      {cliente && <p className="text-xl font-bold mb-4">Expediente Digital - {cliente}</p>}

      {clientValue && (
        <div>
          <DocumentosImportadorMain />
          <DocumentosComercialMain />
          <DocumentosComplementariosMain />
          <DocumentosVulnerablesMain />
        </div>
      )}
    </div>
  );
}

export default function ExpedienteDigitalCliente() {
  return (
    <ClienteProvider>
      <Content />
    </ClienteProvider>
  );
}
