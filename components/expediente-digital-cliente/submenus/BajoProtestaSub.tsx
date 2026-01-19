import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Card, CardContent, CardFooter } from '@/components/ui/card';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';

import * as z from 'zod/v4';

import {
  createPdfSchema,
  expiryDateSchema,
} from '@/components/expediente-digital-cliente/schemas/utilSchema';
import { Checkbox } from '@/components/ui/checkbox';

import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { DownloadFormato } from '../DownloadFormato';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { toast } from 'sonner';
import { PATHS } from '@/lib/expediente-digital-cliente/paths';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

const RENAME_MAP: Record<keyof z.infer<typeof formSchema>, string> = {
  usuarioSolicitoOperacion: 'MANIFIESTO_BAJO_PROTESTA_USUARIO_SOLICITO_OPERACION',
  agenteAduanalVerificoUsuarios: 'MANIFIESTO_BAJO_PROTESTA_AGENTE_ADUANAL_VERIFICO_USUARIOS',
};

const formSchema = z
  .object({
    usuarioSolicitoOperacion: z.object({
      isChecked: z.boolean(),
      file: createPdfSchema(2_000_000).optional(),
      fileExp: expiryDateSchema.optional(),
    }),
    agenteAduanalVerificoUsuarios: z.object({
      isChecked: z.boolean(),
      file: createPdfSchema(2_000_000).optional(),
      fileExp: expiryDateSchema.optional(),
    }),
  })
  .superRefine((val, ctx) => {
    if (!val.usuarioSolicitoOperacion.isChecked) {
      ctx.addIssue({
        code: 'custom',
        path: ['usuarioSolicitoOperacion', 'isChecked'],
        message: 'Debes marcar esta casilla.',
      });
    } else {
      if (!val.usuarioSolicitoOperacion.file) {
        ctx.addIssue({
          code: 'custom',
          path: ['usuarioSolicitoOperacion', 'file'],
          message: 'Adjunta el archivo en PDF.',
        });
      }
    }

    if (!val.agenteAduanalVerificoUsuarios.isChecked) {
      ctx.addIssue({
        code: 'custom',
        path: ['agenteAduanalVerificoUsuarios', 'isChecked'],
        message: 'Debes marcar esta casilla.',
      });
    } else {
      if (!val.agenteAduanalVerificoUsuarios.file) {
        ctx.addIssue({
          code: 'custom',
          path: ['agenteAduanalVerificoUsuarios', 'file'],
          message: 'Adjunta el archivo en PDF.',
        });
      }
    }
  });

export function BajoProtestaSub() {
  const { cliente } = useCliente();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuarioSolicitoOperacion: { isChecked: false, file: undefined },
      agenteAduanalVerificoUsuarios: { isChecked: false, file: undefined },
    },
  });

  const usuarioError =
    form.formState.errors.usuarioSolicitoOperacion?.file ??
    form.formState.errors.usuarioSolicitoOperacion?.isChecked ??
    form.formState.errors.usuarioSolicitoOperacion?.fileExp;

  const agenteError =
    form.formState.errors.agenteAduanalVerificoUsuarios?.file ??
    form.formState.errors.agenteAduanalVerificoUsuarios?.isChecked ??
    form.formState.errors.agenteAduanalVerificoUsuarios?.fileExp;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const path = `/${cliente}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.base}/${PATHS.DOCUMENTOS_IMPORTADOR_EXPORTADOR.subfolders.MANIFIESTO_BAJO_PROTESTA}`;

      const sections = Object.keys(RENAME_MAP) as Array<keyof typeof RENAME_MAP>;

      for (const section of sections) {
        const value = data[section];

        if (!value.isChecked || !value.file) continue;

        const rename = RENAME_MAP[section];

        const formData = new FormData();
        formData.append('path', path);
        formData.append('file', value.file);
        formData.append('rename', rename);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      toast.message('Se subieron los manifiestos correctamente');
      form.reset(data);
    } catch (error) {
      console.error(error);
      toast.message('Error al subir los manifiestos');
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Manifiesto Bajo Protesta
        </AccordionTrigger>

        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-manifiesto-bajo-protesta" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="grid grid-cols-[1rem_1fr_auto] gap-x-4 gap-y-3 items-start">
                    <Controller
                      name="usuarioSolicitoOperacion.isChecked"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="flex items-start justify-center pt-2"
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(!!v)}
                            aria-invalid={fieldState.invalid}
                            className="h-4 w-4"
                          />
                          <DownloadFormato doc="MANIFIESTO_USUARIO_SOLICITO_OPERACION" />
                        </Field>
                      )}
                    />

                    <FileController
                      form={form}
                      fieldLabel="Manifiesto bajo protesta de decir verdad del usuario que solicitó la operación:"
                      controllerName="usuarioSolicitoOperacion.file"
                      accept=".pdf"
                      buttonText="Seleccionar .pdf"
                    />

                    <div className="col-span-3 justify-self-start">
                      {usuarioError && <FieldError errors={[usuarioError]} />}
                    </div>

                    <Controller
                      name="agenteAduanalVerificoUsuarios.isChecked"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field
                          data-invalid={fieldState.invalid}
                          className="flex items-start justify-center pt-2"
                        >
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(!!v)}
                            aria-invalid={fieldState.invalid}
                            className="h-4 w-4"
                          />
                          <DownloadFormato doc="MANIFIESTO_AGENTE_VERIFICO_USUARIO" />
                        </Field>
                      )}
                    />

                    <div className="col-start-2 col-span-2">
                      <FileController
                        form={form}
                        fieldLabel="Manifiesto bajo protesta de decir verdad en el que el Agente Aduanal señale que verificó a los usuarios"
                        controllerName="agenteAduanalVerificoUsuarios.file"
                        accept=".pdf"
                        buttonText="Seleccionar .pdf"
                      />
                    </div>

                    <div className="col-start-2 col-span-2 -mt-1 text-sm text-muted-foreground leading-snug">
                      Artículos 49 Bis fracción X, 69, 69 B y 69 B-Bis del CFF
                    </div>

                    <div className="col-span-3 justify-self-start">
                      {agenteError && <FieldError errors={[agenteError]} />}
                    </div>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-manifiesto-bajo-protesta">
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
