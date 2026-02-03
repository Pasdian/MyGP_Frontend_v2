'use client';

import React from 'react';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { Card, CardContent } from '@/components/ui/card';

import { ClienteProvider, useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

import { ClientMain } from '@/components/expediente-digital-cliente/main/ClientMain';
import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { DocumentosComercialMain } from '@/components/expediente-digital-cliente/main/DocumentosComercialMain';
import { DocumentosComplementariosMain } from '@/components/expediente-digital-cliente/main/DocumentosComplementariosMain';
import { DocumentosVulnerablesMain } from '@/components/expediente-digital-cliente/main/DocumentosVulnerablesMain';

function Content() {
  const [showDocuments, setShowDocuments] = React.useState(false);

  const { cliente, progressMap, getAccordionClassName, getProgressFromKeys, folderMappings } =
    useCliente();

  const allFolderKeys = React.useMemo(() => Object.keys(folderMappings), [folderMappings]);
  const expDigiProgress = getProgressFromKeys(allFolderKeys, progressMap);

  return (
    <PermissionGuard requiredPermissions={[PERM.EXPEDIENTE_DIGITAL_CLIENTE]}>
      {showDocuments && (
        <Card className={getAccordionClassName(allFolderKeys, progressMap)}>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xl text-white">Expediente Digital del Cliente</p>
                <p className="text-white">{cliente}</p>
              </div>
              <p className="text-2xl text-white">{expDigiProgress ?? 0}%</p>
            </div>
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
