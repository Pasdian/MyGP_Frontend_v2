import { Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function ExpiraEnController<TFieldValues extends FieldValues>({
  form,
  controllerName,
  showError = true,
}: {
  form: UseFormReturn<TFieldValues>;
  controllerName: Path<TFieldValues>;
  showError?: boolean;
}) {
  return (
    <Controller
      name={controllerName}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={showError && fieldState.invalid} className="grid gap-0">
          <FieldLabel className="mb-2">Expira en:</FieldLabel>

          <Input {...field} type="date" aria-invalid={showError && fieldState.invalid} />

          {showError && fieldState.invalid ? (
            <div className="mt-1">
              <FieldError errors={[fieldState.error]} />
            </div>
          ) : null}
        </Field>
      )}
    />
  );
}
