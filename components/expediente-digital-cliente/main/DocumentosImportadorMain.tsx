import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { DocumentosImportadorSub } from '@/components/expediente-digital-cliente/submenus/DocumentosImportadorSub';
import { DatosContactoSub } from '@/components/expediente-digital-cliente/submenus/DatosContactoSub';
import { DatosHaciendaImportadorSub } from '@/components/expediente-digital-cliente/submenus/DatosHaciendaImportadorSub';
import { BajoProtestaSub } from '@/components/expediente-digital-cliente/submenus/BajoProtestaSub';
import { AcreditacionSub } from '@/components/expediente-digital-cliente/submenus/AcreditacionSub';
import { HaciendaAgenteAduanalSub } from '@/components/expediente-digital-cliente/submenus/HaciendaAgenteAduanalSub';

import { FileIcon } from 'lucide-react';
import { RepresentanteSub } from '../submenus/RepresentanteSub';

export function DocumentosImportadorMain() {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1 text-white">
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-blue-800 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <FileIcon size={18} />
            <p>Documentos del Importador y/o Exportador</p>
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
