import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { FileIcon } from 'lucide-react';
import { CartaEncomiendaSub } from '@/components/expediente-digital-cliente/submenus/CartaEncomiendaSub';
import { AcuerdoConfidencialidadSub } from '@/components/expediente-digital-cliente/submenus/AcuerdoConfidencialidadSub';
import { TarifasComercialSub } from '@/components/expediente-digital-cliente/submenus/TarifasComercialSub';

export function DocumentosComercialMain() {
  const [value, setValue] = useState<string | undefined>();

  return (
    <Accordion type="single" collapsible className="w-full" value={value} onValueChange={setValue}>
      <AccordionItem value="documentos-comercial-main">
        <AccordionTrigger className="bg-slate-700 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2 place-items-center">
            <FileIcon size={18} />
            <p className="font-bold">Documentos del Área Comercial</p>
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
