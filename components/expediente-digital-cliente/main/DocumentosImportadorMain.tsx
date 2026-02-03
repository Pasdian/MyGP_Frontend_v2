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

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { DatosHaciendaImportadorSub } from '../submenus/DatosHaciendaImportadorSub';
import { RepresentanteSub } from '../submenus/RepresentanteSub';
import { BajoProtestaSub } from '../submenus/BajoProtestaSub';
import { AcreditacionSub } from '../submenus/AcreditacionSub';
import { HaciendaAgenteAduanalSub } from '../submenus/HaciendaAgenteAduanalSub';

export function DocumentosImportadorMain() {
  const { progressMap, folderMappings, getAccordionClassName } = useCliente();

  const [value, setValue] = React.useState<string | undefined>();

  const importerKeys = React.useMemo(
    () => Object.keys(folderMappings).filter((key) => key.startsWith('imp.')),
    [folderMappings]
  );

  const importerProgress = React.useMemo(() => {
    if (importerKeys.length === 0) return 0;
    const total = importerKeys.reduce((sum, k) => sum + Number(progressMap[k] ?? 0), 0);
    return Math.round(total / importerKeys.length);
  }, [importerKeys, progressMap]);

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
