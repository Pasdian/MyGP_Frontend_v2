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
  clearSignal,
  multiple = false,
}: {
  form: UseFormReturn<TFieldValues>;
  fieldLabel: string;
  controllerName: Path<TFieldValues>;
  accept?: string | string[];
  buttonText?: string;
  showFileName?: boolean;
  showError?: boolean;
  clearSignal?: number;
  multiple?: boolean;
}) {
  const acceptValue = typeof accept === 'string' ? accept : accept?.join(',');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <Controller
      name={controllerName}
      control={form.control}
      render={({ field, fieldState }) => {
        const value = field.value as unknown;
        const files = multiple
          ? Array.isArray(value)
            ? value.filter((item): item is File => item instanceof File)
            : []
          : [];
        const singleFile =
          !multiple && value && typeof value === 'object' && value instanceof File ? value : undefined;

        const clear = React.useCallback(() => {
          field.onChange(multiple ? [] : undefined);
          if (inputRef.current) inputRef.current.value = '';
        }, [field, multiple]);

        React.useEffect(() => {
          if (typeof clearSignal === 'number') clear();
        }, [clearSignal, clear]);

        return (
          <Field data-invalid={fieldState.invalid} className="grid gap-0 self-start min-w-0">
            <FieldLabel className="mb-2">{fieldLabel}</FieldLabel>

            <input
              ref={inputRef}
              type="file"
              accept={acceptValue}
              multiple={multiple}
              className="hidden"
              onBlur={field.onBlur}
              onChange={(e) => {
                const list = e.currentTarget.files;
                const next = list ? Array.from(list) : [];
                field.onChange(multiple ? next : next[0] ?? undefined);
                e.currentTarget.value = ''; // allow re-pick same file(s)
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
                  title={multiple ? files.map((f) => f.name).join(', ') : singleFile?.name}
                >
                  {multiple
                    ? files.length
                      ? `${files.length} archivo(s) seleccionado(s)`
                      : 'Ningún archivo seleccionado'
                    : singleFile
                      ? singleFile.name
                      : 'Ningún archivo seleccionado'}
                </div>
              ) : (
                <div className="flex-1 min-w-0" />
              )}

              {((multiple && files.length > 0) || (!multiple && singleFile)) ? (
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
