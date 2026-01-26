'use client';

import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { DocumentosComercialMain } from '@/components/expediente-digital-cliente/main/DocumentosComercialMain';
import { DocumentosComplementariosMain } from '@/components/expediente-digital-cliente/main/DocumentosComplementariosMain';
import { DocumentosVulnerablesMain } from '@/components/expediente-digital-cliente/main/DocumentosVulnerablesMain';
import { ClienteProvider, useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { ClientMain } from '@/components/expediente-digital-cliente/main/ClientMain';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PERM } from '@/lib/modules/permissions';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';

function Content() {
  const [showDocuments, setShowDocuments] = React.useState(false);
  const { cliente } = useCliente();

  return (
    <PermissionGuard requiredPermissions={[PERM.EXPEDIENTE_DIGITAL_CLIENTE]}>
      {showDocuments && (
        <Card className="mb-4 bg-blue-400">
          <CardContent>
            <p className="font-semibold text-xl text-white">Expediente Digital del Cliente</p>
            <p className="text-white">{cliente}</p>
          </CardContent>
        </Card>
      )}

      <ClientMain setShowDocuments={setShowDocuments} />

      {showDocuments && (
        <div>
          <DocumentosImportadorMain />
          <DocumentosComercialMain />
          <DocumentosComplementariosMain />
          <DocumentosVulnerablesMain />
        </div>
      )}
    </PermissionGuard>
  );
}

export default function ExpedienteDigitalCliente() {
  return (
    <ClienteProvider>
      <Content />
    </ClienteProvider>
  );
}
