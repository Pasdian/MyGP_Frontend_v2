'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { mutate } from 'swr';
import PreviosDialog from '../Dialogs/PreviosDialog';
import { Button } from './button';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { deaModuleEvents } from '@/lib/posthog/events';
import { LoaderCircle } from 'lucide-react';
import useSWRImmutableMutation from 'swr/mutation';
import DEAInitialDatePicker from '../datepickers/DEAInitialDatePicker';
import DEAFinalDatePicker from '../datepickers/DEAFinalDatePicker';
import AccessGuard from '../AccessGuard/AccessGuard';
import { useCompaniesEvent } from '@/hooks/useCompaniesEvent';
import { MyGPDeaCombo } from '../comboboxes/MyGPDeaCombo';

const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export function SiteHeader() {
  const pathname = usePathname();
  const {
    clientNumber: client,
    reference,
    initialDate,
    finalDate,
    setClientNumber,
    setInitialDate,
    setFinalDate,
  } = useDEAStore((state) => state);

  const isDEA = pathname === '/mygp/dea';
  const { rows: companies } = useCompaniesEvent(isDEA);
  const companyOptions = React.useMemo(
    () => companies.map((c) => ({ value: c.CVE_IMP, label: c.NOM_IMP })),
    [companies]
  );

  const { trigger: triggerDigitalRecordGeneration, isMutating: isDigitalRecordGenerationMutating } =
    useSWRImmutableMutation(
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
              <MyGPDeaCombo options={companyOptions} setValue={setClientNumber} value={client} />
            </div>
          </div>
          <AccessGuard allowedPermissions={['DEA_PREVIOS']}>
            {reference && (
              <div className="sm:col-span-1 mr-2">
                <PreviosDialog key={reference} />
              </div>
            )}
          </AccessGuard>
          <AccessGuard allowedPermissions={['DEA_EXP_DIGITAL']}>
            {reference && client && (
              <div>
                <Button
                  className="w-full h-7 bg-blue-500 hover:bg-blue-600 font-bold cursor-pointer"
                  onClick={async () => {
                    try {
                      await triggerDigitalRecordGeneration();
                      mutate(`/dea/getFilesByReference?reference=${reference}&client=${client}`);
                      toast.success('Expediente digital generado exitosamente');
                      posthog.capture(posthogEvent);
                    } catch (err) {
                      console.error('Generation Failed', err);
                    }
                  }}
                  // disabled={isDigitalRecordGenerationMutating || hasExpDigital}
                >
                  {isDigitalRecordGenerationMutating ? (
                    <div className="flex items-center justify-center animate-pulse">
                      <LoaderCircle className="animate-spin mr-2" />
                      Generando
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-xs">
                      {/* {(filesByReference?.files?.['05-EXP-DIGITAL'] ?? []).length >= 1 ? (
                        <>
                          <RocketIcon className="mr-2" /> Ya Existe un Expediente Digital
                        </>
                      ) : (
                        <>
                          <RocketIcon className="mr-2" /> Generar Expediente Digital
                        </>
                      )} */}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </AccessGuard>
        </div>
      )}
    </header>
  );
}
