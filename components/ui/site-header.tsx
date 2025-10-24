'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import PreviosDialog from '../Dialogs/PreviosDialog';
import { Button } from './button';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { deaModuleEvents } from '@/lib/posthog/events';
import { LoaderCircle, RocketIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import DEAInitialDatePicker from '../datepickers/DEAInitialDatePicker';
import DEAFinalDatePicker from '../datepickers/DEAFinalDatePicker';
import AccessGuard from '../AccessGuard/AccessGuard';
import { useCompanies } from '@/hooks/useCompanies';
import { ManifestacionDialog } from '../Dialogs/ManifestacionDialog';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';

const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export function SiteHeader() {
  const pathname = usePathname();
  const {
    clientNumber: client,
    reference,
    initialDate,
    finalDate,
    filesByReference,
    setClientNumber,
    setInitialDate,
    setFinalDate,
  } = useDEAStore((state) => state);
  const hasExpediente = (filesByReference?.files?.['05-EXP-DIGITAL'] ?? []).length >= 1;

  const isDEA = pathname === '/mygp/dea';
  const { rows: companies } = useCompanies(isDEA);
  const companyOptions = React.useMemo(
    () => companies.map((c) => ({ value: c.CVE_IMP, label: c.NOM_IMP })),
    [companies]
  );

  const { trigger: triggerDigitalRecordGeneration, isMutating: isDigitalRecordGenerationMutating } =
    useSWRMutation(
      client && reference && `/dea/generateDigitalRecord?client=${client}&reference=${reference}`,
      axiosFetcher
    );

  return (
    <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 z-1">
      <div className="flex">
        <SidebarTrigger className="-ml-1" />
      </div>
      {pathname == '/mygp/dea' && (
        <div className="flex items-center">
          <p className="font-bold text-xs mr-1">Periodo:</p>
          <div>
            <DEAInitialDatePicker date={initialDate} setDate={setInitialDate} />
          </div>
          <div className="mx-1">
            <p>-</p>
          </div>
          <div className="mr-1">
            <DEAFinalDatePicker date={finalDate} setDate={setFinalDate} />
          </div>
          <div className="mr-2">
            <div className="flex items-center">
              <p className="font-bold text-xs mr-1">Cliente:</p>
              <MyGPCombo
                options={companyOptions}
                setValue={setClientNumber}
                value={client}
                className="w-48 h-6 justify-between font-normal text-[12px]"
                placeholder="Selecciona un cliente"
                showValue
              />
            </div>
          </div>
          <div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-[900px]">
            {reference && <ManifestacionDialog key={reference} />}{' '}
            <AccessGuard allowedPermissions={['DEA_PREVIOS']}>
              {reference && <PreviosDialog key={reference} />}
            </AccessGuard>
            <AccessGuard allowedPermissions={['DEA_EXP_DIGITAL']}>
              {reference && client && (
                <MyGPButtonPrimary
                  className="w-full h-7 text-xs"
                  disabled={hasExpediente || isDigitalRecordGenerationMutating}
                  loading={isDigitalRecordGenerationMutating}
                  onClick={async () => {
                    try {
                      await triggerDigitalRecordGeneration();
                      toast.success('Expediente digital generado exitosamente');
                      posthog.capture(posthogEvent);
                    } catch (err) {
                      console.error('Generation Failed', err);
                      toast.error('No se pudo generar el expediente digital.');
                    }
                  }}
                >
                  {!hasExpediente ? (
                    <>
                      <RocketIcon className="mr-2 h-4 w-4" />
                      Expediente Digital
                    </>
                  ) : (
                    <>Ya Existe Expediente Digital</>
                  )}
                </MyGPButtonPrimary>
              )}
            </AccessGuard>
          </div>
        </div>
      )}
    </header>
  );
}
