'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useDEAParams } from '@/hooks/useDEAParams';
import { useDEAContext } from '@/app/providers/dea-store-provider';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import PreviosDialog from '../Dialogs/PreviosDialog';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { deaModuleEvents } from '@/lib/posthog/events';
import { Loader2, RocketIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { useCompanies } from '@/hooks/useCompanies';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import { useAuth } from '@/hooks/useAuth';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import MyGPCalendar from '../MyGPUI/Datepickers/MyGPCalendar';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { COMPANY } from '@/lib/companies/companies';

const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export function SiteHeader() {
  const pathname = usePathname();
  const isDEA = pathname === '/mygp/dea';

  const {
    client,
    reference,
    startDate,
    endDate,
    setClient,
    setReference,
    setDateRange,
  } = useDEAParams();
  const { filesByReference, setFilesByReference } = useDEAContext();

  const digitalFiles = filesByReference?.files?.['05-EXP-DIGITAL'] ?? [];
  const hasDigitalFile = digitalFiles.length > 0;

  const { user, hasCompany } = useAuth();

  const rawUserCompanies = React.useMemo(() => {
    return user?.complete_user?.user?.companies ?? [];
  }, [user]);

  // Exclude 004108 from user companies globally
  const userCompanies = React.useMemo(
    () =>
      rawUserCompanies.filter(
        (c: getAllCompanies) => String(c.CVE_IMP) !== COMPANY.AGENCIA_ADUANAL_PASCAL_SC
      ),
    [rawUserCompanies]
  );

  // Define AAP: user has 004108 originally, not after exclusion
  const isAAP = hasCompany(COMPANY.AGENCIA_ADUANAL_PASCAL_SC);

  const hasExpediente = (filesByReference?.files?.['05-EXP-DIGITAL'] ?? []).length >= 1;

  const { rows: companies } = useCompanies(isDEA);

  const calendarDateRange = React.useMemo(
    () => ({ from: startDate, to: endDate }),
    [startDate, endDate]
  );

  const [companySelect, setCompanySelect] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('dea-user-companies');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        setCompanySelect(parsed);
      }
    } catch {
      console.warn('Invalid data in dea-user-companies');
    }
  }, []);

  const companyOptions = React.useMemo(() => {
    if (!companies || companies.length === 0) return [];

    if (isAAP) {
      // AAP: show all or filter by selection, excluding 004108
      const hasSelection = companySelect && companySelect.length > 0;
      const base = hasSelection
        ? companies.filter(
            (c) =>
              companySelect.includes(String(c.CVE_IMP)) &&
              String(c.CVE_IMP) !== COMPANY.AGENCIA_ADUANAL_PASCAL_SC
          )
        : companies.filter((c) => String(c.CVE_IMP) !== COMPANY.AGENCIA_ADUANAL_PASCAL_SC);

      return base.map((c) => ({
        value: String(c.CVE_IMP),
        label: c.NOM_IMP,
      }));
    }

    // Non-AAP: only show the user's companies (already excluding 004108)
    const userCves = userCompanies.map((c: getAllCompanies) => String(c.CVE_IMP));

    return companies
      .filter(
        (c) =>
          userCves.includes(String(c.CVE_IMP)) &&
          String(c.CVE_IMP) !== COMPANY.AGENCIA_ADUANAL_PASCAL_SC
      )
      .map((c) => ({
        value: String(c.CVE_IMP),
        label: c.NOM_IMP,
      }));
  }, [companies, companySelect, isAAP, userCompanies]);

  const { trigger: triggerDigitalRecordGeneration, isMutating: isDigitalRecordGenerationMutating } =
    useSWRMutation(
      client &&
        reference &&
        `/pyapi/dea/generateDigitalRecord?client=${client}&reference=${reference}`,
      axiosFetcher
    );

  if (!isDEA) {
    return (
      <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
      </header>
    );
  }

  return (
    <header className="bg-background sticky top-0 z-10 shrink-0 border-b">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 px-2 py-3 sm:px-4">
        <SidebarTrigger className="-ml-1 size-9 shrink-0 self-start sm:size-7 sm:self-auto" />

        <div className="flex min-w-[14rem] flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-xs font-semibold sm:shrink-0">Periodo:</p>
          <MyGPCalendar
            dateRange={calendarDateRange}
            setDateRange={(dr) => {
              if (dr?.from && dr?.to) {
                setDateRange(dr.from, dr.to);
              }
            }}
            className="h-9 text-sm sm:h-8 sm:min-w-[13rem] sm:text-xs"
          />
        </div>

        <div className="flex min-w-[18rem] flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <p className="text-xs font-semibold sm:shrink-0">Cliente:</p>
          <MyGPCombo
            options={companyOptions}
            setValue={(val) => {
              setClient(val);
            }}
            value={client}
            onSelect={() => {}}
            className="h-9 w-full text-sm sm:h-8 sm:w-[18rem] sm:text-xs xl:w-[19rem]"
            popoverContentClassName="w-[min(90vw,600px)]"
            placeholder="Selecciona un cliente"
            showValue
            pickFirst
          />
        </div>


        <PermissionGuard requiredPermissions={[PERM.DEA_PREVIOS]}>
          {reference && (
            <PreviosDialog
              key={reference}
              className="h-9 basis-full px-4 text-sm sm:h-8 sm:min-w-[10.5rem] sm:basis-auto sm:text-xs sm:whitespace-nowrap"
            />
          )}
        </PermissionGuard>

        <PermissionGuard requiredPermissions={[PERM.DEA_EXP_DIGITAL]}>
          {reference && client && (
            <MyGPButtonPrimary
              className="h-9 basis-full px-4 text-sm sm:h-8 sm:min-w-[12.5rem] sm:basis-auto sm:text-xs sm:whitespace-nowrap"
              disabled={hasDigitalFile || hasExpediente || isDigitalRecordGenerationMutating}
              onClick={async () => {
                try {
                  const response = await triggerDigitalRecordGeneration();

                  if (filesByReference) {
                    const updated = {
                      ...filesByReference,
                      files: {
                        ...filesByReference.files,
                        '05-EXP-DIGITAL': [...digitalFiles, response.filename],
                      },
                    };
                    setFilesByReference(updated);
                  }

                  toast.success(`Expediente digital generado: ${response.filename}`);
                  posthog.capture(posthogEvent);
                } catch (err) {
                  console.error('Generation Failed', err);
                  toast.error('No se pudo generar el expediente digital.');
                }
              }}
            >
              {isDigitalRecordGenerationMutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : hasDigitalFile || hasExpediente ? (
                <>Ya Existe Expediente Digital</>
              ) : (
                <>
                  <RocketIcon className="mr-2 h-4 w-4" />
                  Expediente Digital
                </>
              )}
            </MyGPButtonPrimary>
          )}
        </PermissionGuard>
      </div>
    </header>
  );
}
