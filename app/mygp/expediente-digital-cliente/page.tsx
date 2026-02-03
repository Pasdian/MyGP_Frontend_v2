'use client';

import { DocumentosImportadorMain } from '@/components/expediente-digital-cliente/main/DocumentosImportadorMain';
import { ClienteProvider, useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { ClientMain } from '@/components/expediente-digital-cliente/main/ClientMain';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PERM } from '@/lib/modules/permissions';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import ExpDigiCard from '@/components/expediente-digital-cliente/submenus/ExpDigiCard';

function Content() {
  const [showDocuments, setShowDocuments] = React.useState(false);
  const [isFetchingProgress, setIsFetchingProgress] = React.useState(false);
  const [progressData, setProgressData] = React.useState<any>(null);

  const { cliente, progressMap, getAccordionClassName, getProgressFromKeys } = useCliente();
  const allKeys = ['imp.docs', 'imp.contact', 'imp.tax', 'rep.docs', 'manifiestos', 'agent.docs'];
  const expDigiProgress = getProgressFromKeys(allKeys, progressMap);

  return (
    <PermissionGuard requiredPermissions={[PERM.EXPEDIENTE_DIGITAL_CLIENTE]}>
      {showDocuments && (
        <Card className={getAccordionClassName(allKeys, progressMap)}>
          <CardContent>
            <div>
              <div>
                <p className="font-semibold text-xl text-white">Expediente Digital del Cliente</p>
                <p className="text-white">{cliente}</p>
              </div>
              <p className="text-2xl">{expDigiProgress ?? 0}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      <ClientMain setShowDocuments={setShowDocuments} />

      {showDocuments && (
        <div>
          <DocumentosImportadorMain />

          {/* <DocumentosComercialMain />
          <DocumentosComplementariosMain />
          <DocumentosVulnerablesMain /> */}
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
