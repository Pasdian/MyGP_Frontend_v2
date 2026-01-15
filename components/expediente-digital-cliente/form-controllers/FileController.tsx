import * as React from 'react';
import { Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

export function FileController<TFieldValues extends FieldValues>({
  form,
  fieldLabel,
  controllerName,
  accept = 'application/pdf',
  buttonText = 'Seleccionar archivo',
  showFileName = true,
  showError = true,
}: {
  form: UseFormReturn<TFieldValues>;
  fieldLabel: string;
  controllerName: Path<TFieldValues>;
  accept?: string;
  buttonText?: string;
  showFileName?: boolean;
  showError?: boolean;
}) {
  return (
    <Controller
      name={controllerName}
      control={form.control}
      render={({ field, fieldState }) => {
        const file = field.value as File | undefined;
        const inputRef = React.useRef<HTMLInputElement | null>(null);

        const clear = () => {
          field.onChange(undefined);
          if (inputRef.current) inputRef.current.value = '';
        };

        return (
          <Field data-invalid={fieldState.invalid} className="grid gap-0 self-start min-w-0">
            <FieldLabel className="mb-2">{fieldLabel}</FieldLabel>

            {/* Hidden native input */}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onBlur={field.onBlur}
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                field.onChange(f ?? undefined);
                e.currentTarget.value = ''; // allow re-pick same file
              }}
            />

            <div className="flex h-10 w-full min-w-0 items-center rounded-md border bg-background px-3 overflow-hidden">
              <Button
                type="button"
                variant="outline"
                className="h-8 shrink-0"
                onClick={() => inputRef.current?.click()}
              >
                {buttonText}
              </Button>

              {showFileName ? (
                <div
                  className="ml-3 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm opacity-70"
                  title={file?.name}
                >
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </div>
              ) : (
                <div className="flex-1 min-w-0" />
              )}

              {file ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar archivo"
                  onClick={clear}
                  className="h-8 w-8 shrink-0"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            {showError && fieldState.invalid ? (
              <div className="mt-1">
                <FieldError errors={[fieldState.error]} />
              </div>
            ) : null}
          </Field>
        );
      }}
    />
  );
}
