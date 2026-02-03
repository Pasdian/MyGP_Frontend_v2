'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { DocumentosImportadorSub } from '@/components/expediente-digital-cliente/submenus/DocumentosImportadorSub';
import { DatosContactoSub } from '@/components/expediente-digital-cliente/submenus/DatosContactoSub';

import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { DatosHaciendaImportadorSub } from '../submenus/DatosHaciendaImportadorSub';
import { RepresentanteSub } from '../submenus/RepresentanteSub';
import { BajoProtestaSub } from '../submenus/BajoProtestaSub';
import { AcreditacionSub } from '../submenus/AcreditacionSub';
import { HaciendaAgenteAduanalSub } from '../submenus/HaciendaAgenteAduanalSub';

type ProgressResponse = {
  client_id: string;
  overall: { scannedFiles: number; requiredFiles: number; progress: number };
  byDocKey: Record<string, { scannedFiles: number; requiredFiles: number; progress: number }>;
};

export function DocumentosImportadorMain() {
  const {
    casa_id,
    progressMap,
    setProgressMap,
    folderMappings,
    setFolderProgressFromDocKeys,
    getAccordionClassName,
    getProgressFromKeys,
  } = useCliente();

  const [value, setValue] = React.useState<string | undefined>();

  const importerKeys = React.useMemo(
    () => Object.keys(folderMappings).filter((key) => key.startsWith('imp.')),
    [folderMappings]
  );

  const fetchAllProgress = React.useCallback(async () => {
    try {
      const foldersWithDocKeys = importerKeys
        .map((folderKey) => ({
          folderKey,
          docKeys: folderMappings[folderKey]?.docKeys ?? [],
        }))
        .filter((x) => x.docKeys.length > 0);

      const results = await Promise.all(
        foldersWithDocKeys.map(async ({ folderKey, docKeys }) => {
          const res = await GPClient.get<ProgressResponse>(
            '/expediente-digital-cliente/getProgressByDocKeys',
            {
              params: {
                client_id: casa_id,
                'docKeys[]': docKeys,
              },
            }
          );

          return { folderKey, docKeys, byDocKey: res.data?.byDocKey ?? {} };
        })
      );

      setProgressMap((prev) => {
        const next = { ...prev };

        for (const r of results) {
          for (const k of r.docKeys) next[k] = r.byDocKey[k]?.progress ?? 0;
        }

        return next;
      });

      for (const r of results) setFolderProgressFromDocKeys(r.folderKey, r.docKeys);
    } catch (e) {
      console.error(e);
    }
  }, [importerKeys, folderMappings, casa_id, setProgressMap, setFolderProgressFromDocKeys]);

  React.useEffect(() => {
    if (!casa_id) return;
    fetchAllProgress();
  }, [casa_id, fetchAllProgress]);

  const importerProgress = getProgressFromKeys(importerKeys, progressMap);

  return (
    <Accordion type="single" collapsible className="w-full" value={value} onValueChange={setValue}>
      <AccordionItem value="documentos-importador-main">
        <AccordionTrigger className={getAccordionClassName(importerKeys, progressMap)}>
          <div>
            <p>Documentos del Importador y/o Exportador - {importerProgress}% completado</p>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <DocumentosImportadorSub />
          <DatosContactoSub />
          <DatosHaciendaImportadorSub />
          <RepresentanteSub />
          <BajoProtestaSub />
          <AcreditacionSub />
          <HaciendaAgenteAduanalSub />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
