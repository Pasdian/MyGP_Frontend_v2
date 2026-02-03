import React from 'react';
import { Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError } from '@/components/ui/field';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { IsComplete } from './buttons/IsComplete';
import { ShowFile } from './buttons/ShowFile';

type Props = {
  form: any;

  client: string; // casa_id
  docKey: string; // "man.usuario" | "man.agente"

  checkName: string; // "usuarioSolicitoOperacion.isChecked"
  checkLabel: React.ReactNode;

  controllerName: string; // "usuarioSolicitoOperacion.file.file"
  fieldLabel: string;

  accept?: string[];
  buttonText?: string;
  description?: string;

  error?: any;
  showFile?: boolean;
};

export function InputControllerWithCheck({
  form,
  client,
  docKey,
  checkName,
  checkLabel,
  controllerName,
  fieldLabel,
  accept = ['application/pdf'],
  buttonText = 'Selecciona .pdf',
  description,
  error,
  showFile = true,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-[2rem_auto_1fr_auto] gap-x-4 items-start">
        <div className="pt-2 flex justify-center">
          {showFile ? <ShowFile client={client} docKey={docKey} /> : null}
        </div>

        <Controller
          name={checkName as any}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-auto inline-flex items-start gap-2 pt-2"
            >
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
                aria-invalid={fieldState.invalid}
                className="h-4 w-4 shrink-0"
              />
              {checkLabel}
            </Field>
          )}
        />

        <div className="space-y-1">
          <FileController
            form={form}
            fieldLabel={fieldLabel}
            controllerName={controllerName}
            accept={accept}
            buttonText={buttonText}
          />
          {description ? (
            <div className="text-sm text-muted-foreground leading-snug">{description}</div>
          ) : null}
        </div>

        <IsComplete docKey={docKey} />
      </div>

      {error ? <FieldError errors={[error]} /> : null}
    </>
  );
}
