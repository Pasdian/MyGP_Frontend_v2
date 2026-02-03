import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Accordion,
} from '@/components/ui/accordion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import React from 'react';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

export default function ExpDigiCard({
  title,
  children,
  folderKey,
  formId,
  isFormSubmitting,
  onReset,
  disableResetWhileSubmitting = true,
}: {
  title: string;
  children: React.ReactNode;
  folderKey: string;
  formId: string;
  isFormSubmitting: boolean;
  onReset?: () => void;
  disableResetWhileSubmitting?: boolean;
}) {
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const { progressMap, getAccordionClassName } = useCliente();

  const progress = progressMap[folderKey] ?? 0;

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? folderKey : ''}
      onValueChange={(val) => setAccordionOpen(val === folderKey)}
    >
      <AccordionItem value={folderKey} className="ml-4">
        <AccordionTrigger className={getAccordionClassName([folderKey], progressMap)}>
          <div>
            <p>
              {title} - {progress}% completado
              {isFormSubmitting ? ' (guardando...)' : null}
            </p>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <Card className="w-full">
            <CardContent>{children}</CardContent>

            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                {onReset && (
                  <MyGPButtonGhost
                    type="button"
                    onClick={onReset}
                    disabled={disableResetWhileSubmitting ? isFormSubmitting : false}
                  >
                    Reiniciar
                  </MyGPButtonGhost>
                )}

                <MyGPButtonSubmit form={formId} isSubmitting={isFormSubmitting}>
                  Guardar Cambios
                </MyGPButtonSubmit>
              </Field>
            </CardFooter>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
