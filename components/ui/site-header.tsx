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
import { Loader2, RocketIcon } from 'lucide-react';
import useSWRMutation from 'swr/mutation';
import { useCompanies } from '@/hooks/useCompanies';
import { MyGPCombo } from '../MyGPUI/Combobox/MyGPCombo';
import { MyGPButtonPrimary } from '../MyGPUI/Buttons/MyGPButtonPrimary';
import DEAFilterCompanyDriver from '../driver/DEAFilterCompanyDriver';
import { useAuth } from '@/hooks/useAuth';
import { getAllCompanies } from '@/types/getAllCompanies/getAllCompanies';
import MyGPCalendar from '../MyGPUI/Datepickers/MyGPCalendar';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import { COMPANY } from '@/lib/companies/companies';

const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export function SiteHeader() {
  const pathname = usePathname();

  // === Pull nested state & minimal setters from the refactored DEA store ===
  const { client, filters, file, setClient, setFilters, setFile, resetFileState } = useDEAStore(
    (state) => state
  );

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

  const hasExpediente = (file?.filesByReference?.files?.['05-EXP-DIGITAL'] ?? []).length >= 1;

  const isDEA = pathname === '/mygp/dea';
  const { rows: companies } = useCompanies(isDEA);

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
      client.number &&
        client.reference &&
        `/dea/generateDigitalRecord?client=${client.number}&reference=${client.reference}`,
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
          <MyGPCalendar
            dateRange={filters.dateRange}
            setDateRange={(dr) => setFilters({ dateRange: dr })}
            className="text-xs h-5"
          />
          <p className="font-bold text-xs mr-1">Cliente:</p>
          <MyGPCombo
            options={companyOptions}
            setValue={(val) => {
              setClient({ number: val });
              setClient({ reference: '' });
            }}
            value={client.number}
            onSelect={() => resetFileState()}
            className="h-5 text-xs w-[300px]"
            popoverContentClassName="w-[600px]"
            placeholder="Selecciona un cliente"
            showValue
            pickFirst
          />
          {isAAP && (
            <DEAFilterCompanyDriver
              companySelect={companySelect}
              setCompanySelect={setCompanySelect}
            />
          )}
          <PermissionGuard requiredPermissions={[PERM.DEA_PREVIOS]}>
            {client.reference && (
              <PreviosDialog key={client.reference} className="text-xs h-5 w-[150px]" />
            )}
          </PermissionGuard>

          <PermissionGuard requiredPermissions={[PERM.DEA_EXP_DIGITAL]}>
            {client.reference && client.number && (
              <MyGPButtonPrimary
                className="h-5 text-xs w-[200px]"
                disabled={
                  file?.filesByReference?.files?.['05-EXP-DIGITAL']?.length > 0 ||
                  hasExpediente ||
                  isDigitalRecordGenerationMutating
                }
                onClick={async () => {
                  try {
                    const response = await triggerDigitalRecordGeneration();

                    if (file.filesByReference) {
                      const current = file.filesByReference.files?.['05-EXP-DIGITAL'] ?? [];
                      const updated = {
                        ...file.filesByReference,
                        files: {
                          ...file.filesByReference.files,
                          '05-EXP-DIGITAL': [...current, response.filename],
                        },
                      };
                      setFile({ filesByReference: updated });
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
                ) : !hasExpediente ? (
                  <>
                    <RocketIcon className="mr-2 h-4 w-4" />
                    Expediente Digital
                  </>
                ) : (
                  <>Ya Existe Expediente Digital</>
                )}
              </MyGPButtonPrimary>
            )}
          </PermissionGuard>
        </div>
      )}
    </header>
  );
}
