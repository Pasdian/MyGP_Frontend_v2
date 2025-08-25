'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import InitialDatePicker from '../datepickers/ChartInitialDatePicker';
import { useDEAStore } from '@/app/providers/dea-store-provider';
import { getFilesByReference } from '@/types/dea/getFilesByReferences';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import useSWRImmutable, { mutate } from 'swr';
import FinalDatePicker from '../datepickers/ChartFinalDatePicker';
import ClientsCombo from '../comboboxes/ClientsCombo';
import PermissionGuard from '../PermissionGuard/PermissionGuard';
import PreviosDialog from '../Dialogs/PreviosDialog';
import { Button } from './button';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import { deaModuleEvents } from '@/lib/posthog/events';
import { LoaderCircle, RocketIcon } from 'lucide-react';
import useSWRImmutableMutation from 'swr/mutation';
import { useAuth } from '@/hooks/useAuth';
import DEAInitialDatePicker from '../datepickers/DEAInitialDatePicker';
import DEAFinalDatePicker from '../datepickers/DEAFinalDatePicker';
import DEAClientsCombo from '../comboboxes/DEAClientsCombo';
const posthogEvent = deaModuleEvents.find((e) => e.alias === 'DEA_DIGITAL_RECORD')?.eventName || '';

export function SiteHeader() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [subfolder, setSubfolder] = React.useState('');
  const isAdmin = user?.complete_user?.role?.name === 'ADMIN';
  const [clientName, setClientName] = React.useState('');

  const pathname = usePathname();
  const {
    clientNumber: client,
    reference,
    setClientNumber,
    initialDate,
    finalDate,
    setInitialDate,
    setFinalDate,
    setPdfUrl,
    setFile,
    getFilesByReferenceKey,
  } = useDEAStore((state) => state);
  const {
    data: filesByReference,
    isValidating: isFilesByReferenceValidating,
  }: { data: getFilesByReference; isLoading: boolean; isValidating: boolean } = useSWRImmutable(
    getFilesByReferenceKey,
    axiosFetcher
  );

  // Generate breadcrumbs from the current path
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const href = '/' + array.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { href, label };
    });
  const files = React.useMemo(
    () => filesByReference?.files ?? ({} as Record<string, string[]>),
    [filesByReference]
  );

  const filesExpDigital = React.useMemo(() => files['05-EXP-DIGITAL'] ?? [], [files]);
  const hasExpDigital = React.useMemo(() => filesExpDigital.length >= 1, [filesExpDigital]);
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
          <p className="font-bold text-sm mr-1">Periodo:</p>
          <div>
            <DEAInitialDatePicker
              date={initialDate}
              setDate={setInitialDate}
              onSelect={() => {
                setFile('');
                setSubfolder('');
                setPdfUrl('');
              }}
            />
          </div>
          <div className="mx-1">
            <p>-</p>
          </div>
          <div className="mr-1">
            <DEAFinalDatePicker
              date={finalDate}
              setDate={setFinalDate}
              onSelect={() => {
                setFile('');
                setSubfolder('');
                setPdfUrl('');
              }}
            />
          </div>
          <div>
            <p className="font-bold text-sm mr-1">Cliente:</p>
          </div>
          <div className="mr-2">
            {isAdmin && (
              <DEAClientsCombo
                clientName={clientName}
                setClientName={setClientName}
                setClientNumber={setClientNumber}
                onSelect={() => {
                  setFile('');
                  setSubfolder('');
                  setPdfUrl('');
                }}
              />
            )}
          </div>
          <PermissionGuard allowedPermissions={['DEA_PREVIOS']}>
            {filesByReference && reference && (
              <div className="sm:col-span-1 mr-2">
                <PreviosDialog key={reference} />
              </div>
            )}
          </PermissionGuard>
          <PermissionGuard allowedPermissions={['DEA_EXP_DIGITAL']}>
            {filesByReference && reference && client && (
              <div>
                <Button
                  className="w-full h-7 bg-blue-500 hover:bg-blue-600 font-bold cursor-pointer"
                  onClick={async () => {
                    try {
                      await triggerDigitalRecordGeneration();
                      mutate(getFilesByReferenceKey);
                      toast.success('Expediente digital generado exitosamente');
                      posthog.capture(posthogEvent);
                    } catch (err) {
                      console.error('Generation Failed', err);
                    }
                  }}
                  disabled={isDigitalRecordGenerationMutating || hasExpDigital}
                >
                  {isDigitalRecordGenerationMutating ? (
                    <div className="flex items-center justify-center animate-pulse">
                      <LoaderCircle className="animate-spin mr-2" />
                      Generando
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {(filesByReference?.files?.['05-EXP-DIGITAL'] ?? []).length >= 1 ? (
                        <>
                          <RocketIcon className="mr-2" /> Ya Existe un Expediente Digital
                        </>
                      ) : (
                        <>
                          <RocketIcon className="mr-2" /> Generar Expediente Digital
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </PermissionGuard>
        </div>
      )}
    </header>
  );
}
