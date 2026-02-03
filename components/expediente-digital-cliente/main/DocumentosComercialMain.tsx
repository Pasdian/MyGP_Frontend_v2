'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

import { CartaEncomiendaSub } from '../submenus/CartaEncomiendaSub';
import { AcuerdoConfidencialidadSub } from '../submenus/AcuerdoConfidencialidadSub';
import { TarifasComercialSub } from '../submenus/TarifasComercialSub';

export function DocumentosComercialMain() {
  const { progressMap, folderMappings, getAccordionClassName } = useCliente();

  const [value, setValue] = React.useState<string | undefined>();

  const comercialKeys = React.useMemo(
    () => Object.keys(folderMappings).filter((key) => key.startsWith('com.')),
    [folderMappings]
  );

  // Compute overall "comercial" progress as avg of folder progresses already stored in progressMap
  const comercialProgress = React.useMemo(() => {
    if (comercialKeys.length === 0) return 0;
    const total = comercialKeys.reduce((sum, k) => sum + Number(progressMap[k] ?? 0), 0);
    return Math.round(total / comercialKeys.length);
  }, [comercialKeys, progressMap]);

  return (
    <Accordion type="single" collapsible className="w-full" value={value} onValueChange={setValue}>
      <AccordionItem value="documentos-comercial-main">
        <AccordionTrigger className={getAccordionClassName(comercialKeys, progressMap)}>
          <div>
            <p>Documentos del Área Comercial - {comercialProgress}% completado</p>
          </div>
        </AccordionTrigger>

        <AccordionContent className="flex flex-col gap-2 text-balance">
          <CartaEncomiendaSub />
          <AcuerdoConfidencialidadSub />
          <TarifasComercialSub />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
