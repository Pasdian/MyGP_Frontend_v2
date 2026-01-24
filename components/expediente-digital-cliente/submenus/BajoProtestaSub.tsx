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
import { FOLDERFILESTRUCT } from '@/lib/expediente-digital-cliente/folderFileStruct';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import React from 'react';
import { revalidateFileExists, ShowFile } from '../buttons/ShowFile';

const _manifiestoBajoProtesta =
  FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.MANIFIESTO_BAJO_PROTESTA;

if (!_manifiestoBajoProtesta?.docs) {
  throw new Error('Missing MANIFIESTO_BAJO_PROTESTA docs');
}

const formSchema = z
  .object({
    usuarioSolicitoOperacion: z.object({
      isChecked: z.boolean(),
      file: createPdfSchema(
        _manifiestoBajoProtesta.docs?.USUARIO_SOLICITO_OPERACION?.size || 2_000_000
      ).optional(),
      fileExp: expiryDateSchema.optional(),
    }),
    agenteAduanalVerificoUsuarios: z.object({
      isChecked: z.boolean(),
      file: createPdfSchema(
        _manifiestoBajoProtesta.docs?.AGENTE_ADUANAL_VERIFICO_USUARIOS?.size || 2_000_000
      ).optional(),
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

const RENAME_MAP: Record<keyof z.infer<typeof formSchema>, string> = {
  usuarioSolicitoOperacion: _manifiestoBajoProtesta.docs.USUARIO_SOLICITO_OPERACION.filename,
  agenteAduanalVerificoUsuarios:
    _manifiestoBajoProtesta.docs.AGENTE_ADUANAL_VERIFICO_USUARIOS.filename,
};

type FormValues = z.infer<typeof formSchema>;

export function BajoProtestaSub() {
  const { casa_id, cliente } = useCliente();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const DOCUMENTOS_IMPORTADOR_EXPORTADOR = FOLDERFILESTRUCT.DOCUMENTOS_IMPORTADOR_EXPORTADOR;
  const MANIFIESTO_BAJO_PROTESTA =
    DOCUMENTOS_IMPORTADOR_EXPORTADOR.children?.MANIFIESTO_BAJO_PROTESTA;

  const MANIFIESTO_BAJO_PROTESTA_DOCS = MANIFIESTO_BAJO_PROTESTA?.docs;

  const basePath = `/${casa_id} ${cliente}/${DOCUMENTOS_IMPORTADOR_EXPORTADOR.name}/${MANIFIESTO_BAJO_PROTESTA?.name}`;

  const usuarioSolicitoOperacionPath = `${basePath}/${MANIFIESTO_BAJO_PROTESTA_DOCS?.USUARIO_SOLICITO_OPERACION.filename}`;
  const agenteAduanalVerificoUsuariosPath = `${basePath}/${MANIFIESTO_BAJO_PROTESTA_DOCS?.AGENTE_ADUANAL_VERIFICO_USUARIOS.filename}`;

  const form = useForm<FormValues>({
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

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const sections = Object.keys(RENAME_MAP) as Array<keyof typeof RENAME_MAP>;

      for (const section of sections) {
        const value = data[section];
        if (!value.isChecked || !value.file) continue;

        const formData = new FormData();
        formData.append('path', basePath);
        formData.append('file', value.file);
        formData.append('rename', RENAME_MAP[section]);

        await GPClient.post('/expediente-digital-cliente/uploadFile', formData);
      }

      toast.message('Se subieron los manifiestos correctamente');

      await Promise.all([
        revalidateFileExists(usuarioSolicitoOperacionPath),
        revalidateFileExists(agenteAduanalVerificoUsuariosPath),
      ]);

      form.reset(data);
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      console.error(error);
      toast.message('Error al subir los manifiestos');
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={accordionOpen ? 'manifiesto-bajo-protesta' : ''}
      onValueChange={(val) => setAccordionOpen(val === 'manifiesto-bajo-protesta')}
    >
      <AccordionItem value="manifiesto-bajo-protesta" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">
          Manifiesto Bajo Protesta
        </AccordionTrigger>

        <AccordionContent>
          <Card>
            <CardContent>
              <form id="form-manifiesto-bajo-protesta" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <div className="space-y-3">
                    {/* Row 1 */}
                    <div className="grid grid-cols-[2rem_auto_1fr] gap-x-4 items-start">
                      <div className="pt-2 flex justify-center">
                        <ShowFile shouldFetch={accordionOpen} path={usuarioSolicitoOperacionPath} />
                      </div>

                      <Controller
                        name="usuarioSolicitoOperacion.isChecked"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="w-auto inline-flex items-start gap-2 pt-2"
                          >
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(!!v)}
                              aria-invalid={fieldState.invalid}
                              className="h-4 w-4 shrink-0"
                            />
                            <DownloadFormato doc="MANIFIESTO_USUARIO_SOLICITO_OPERACION" />
                          </Field>
                        )}
                      />

                      <FileController
                        form={form}
                        fieldLabel="Manifiesto bajo protesta de decir verdad del usuario que solicitó la operación:"
                        controllerName="usuarioSolicitoOperacion.file"
                        accept={['application/pdf', 'image/png', 'image/jpeg']}
                        buttonText="Selecciona .pdf .png .jpeg"
                      />
                    </div>

                    {usuarioError ? <FieldError errors={[usuarioError]} /> : null}

                    {/* Row 2 */}
                    <div className="grid grid-cols-[2rem_auto_1fr] gap-x-4 items-start">
                      <div className="pt-2 flex justify-center">
                        <ShowFile
                          shouldFetch={accordionOpen}
                          path={agenteAduanalVerificoUsuariosPath}
                        />
                      </div>

                      <Controller
                        name="agenteAduanalVerificoUsuarios.isChecked"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="w-auto inline-flex items-start gap-2 pt-2"
                          >
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(!!v)}
                              aria-invalid={fieldState.invalid}
                              className="h-4 w-4 shrink-0"
                            />
                            <DownloadFormato doc="MANIFIESTO_AGENTE_VERIFICO_USUARIO" />
                          </Field>
                        )}
                      />

                      <div className="space-y-1">
                        <FileController
                          form={form}
                          fieldLabel="Manifiesto bajo protesta de decir verdad en el que el Agente Aduanal señale que verificó a los usuarios"
                          controllerName="agenteAduanalVerificoUsuarios.file"
                          accept={['application/pdf', 'image/png', 'image/jpeg']}
                          buttonText="Selecciona .pdf .png .jpeg"
                        />

                        <div className="text-sm text-muted-foreground leading-snug">
                          Artículos 49 Bis fracción X, 69, 69 B y 69 B-Bis del CFF
                        </div>
                      </div>
                    </div>

                    {agenteError ? <FieldError errors={[agenteError]} /> : null}
                  </div>
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className="flex items-end">
              <Field orientation="horizontal" className="justify-end">
                <MyGPButtonGhost onClick={() => form.reset()}>Reiniciar</MyGPButtonGhost>
                <MyGPButtonSubmit form="form-manifiesto-bajo-protesta" isSubmitting={isSubmitting}>
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
