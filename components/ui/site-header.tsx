'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import PreviosDialog from '../Dialogs/PreviosDialog';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { deaModuleEvents } from '@/lib/posthog/events';
import { RocketIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import AccessGuard from '../AccessGuard/AccessGuard';
import { useCompanies } from '@/hooks/useCompanies';
import { ManifestacionDialog } from '../Dialogs/ManifestacionDialog';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import MyGPDatePicker from '../MyGPUI/Datepickers/MyGPDatePicker';
import DEAFilterCompanyDriver from '../driver/DEAFilterCompanyDriver';

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
  const [companySelect, setCompanySelect] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dea-user-companies');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
            return parsed;
          }
        } catch {
          console.warn('Invalid data in dea-user-companies');
        }
      }
    }
    return [];
  });

  const isDEA = pathname === '/mygp/dea';
  const { rows: companies } = useCompanies(isDEA);

  const companyOptions = React.useMemo(() => {
    if (!companies || companies.length === 0) return [];

    return companies
      .filter((c) => companySelect.includes(String(c.CVE_IMP))) // filter by selection
      .map((c) => ({
        value: String(c.CVE_IMP),
        label: c.NOM_IMP,
      }));
  }, [companies, companySelect]);

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
        <div className="font-bold grid grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto_auto] items-center gap-2 w-fit">
          <p className="text-xs">Periodo:</p>
          <MyGPDatePicker date={initialDate} setDate={setInitialDate} className="text-xs h-5" />
          <p className="text-xs">A</p>
          <MyGPDatePicker date={finalDate} setDate={setFinalDate} className="text-xs h-5" />
          <p className="font-bold text-xs mr-1">Cliente:</p>
          <MyGPCombo
            options={companyOptions}
            setValue={setClientNumber}
            value={client}
            className="h-5 text-xs w-[200px]"
            placeholder="Selecciona un cliente"
            showValue
            pickFirst
          />
          <DEAFilterCompanyDriver
            companySelect={companySelect}
            setCompanySelect={setCompanySelect}
          />
          {reference && <ManifestacionDialog className="h-5 text-xs w-[200px]" key={reference} />}
          <AccessGuard allowedPermissions={['DEA_PREVIOS']}>
            {reference && <PreviosDialog key={reference} className="text-xs h-5 w-[150px]" />}
          </AccessGuard>

          <AccessGuard allowedPermissions={['DEA_EXP_DIGITAL']}>
            {reference && client && (
              <MyGPButtonPrimary
                className="h-5 text-xs w-[200px]"
                disabled={!filesByReference || hasExpediente || isDigitalRecordGenerationMutating}
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
      )}
    </header>
  );
}
