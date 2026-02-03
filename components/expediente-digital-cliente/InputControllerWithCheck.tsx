import React from 'react';
import { Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError } from '@/components/ui/field';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';
import { IsComplete } from './buttons/IsComplete';
import { ShowFile } from './buttons/ShowFile';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';

type Props = {
  form: any;

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
  const { casa_id } = useCliente();

  const showMiddle = showFile;
  const gridCols = showMiddle ? 'grid-cols-[auto_auto_1fr_auto]' : 'grid-cols-[auto_1fr_auto]';

  return (
    <>
      <div className={`w-full grid ${gridCols} gap-2 items-end`}>
        {showMiddle && (
          <div className="flex flex-col gap-2 items-center">
            <ShowFile
              client={casa_id}
              docKey={docKey}
              disabled={!showFile}
              className={!showFile ? 'opacity-50' : undefined}
            />
          </div>
        )}

        <Controller
          name={checkName as any}
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-auto inline-flex items-start gap-2"
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
