'use client';

import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { DocumentosComercialMain } from '@/components/expediente-digital-cliente/main/DocumentosComercialMain';
import { DocumentosComplementariosMain } from '@/components/expediente-digital-cliente/main/DocumentosComplementariosMain';
import { DocumentosVulnerablesMain } from '@/components/expediente-digital-cliente/main/DocumentosVulnerablesMain';
import { ClienteProvider } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { ClientMain } from '@/components/expediente-digital-cliente/main/ClientMain';
import React from 'react';

function Content() {
  const [showDocuments, setShowDocuments] = React.useState(false);

  return (
    <div>
      <ClientMain setShowDocuments={setShowDocuments} />
      {showDocuments && (
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
