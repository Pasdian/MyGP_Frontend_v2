import { Controller } from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function MultiImageController(props: {
  name: string;
  control: any;
  label: string;
  description?: string;
  accept: string[];
}) {
  return (
    <Controller
      name={props.name as any}
      control={props.control}
      render={({ field, fieldState }) => {
        const files: File[] = Array.isArray(field.value) ? field.value : [];

        return (
          <Field data-invalid={fieldState.invalid} className="grid gap-0 self-start">
            <FieldLabel className="mb-2">{props.label}</FieldLabel>

            <Input
              aria-invalid={fieldState.invalid}
              type="file"
              multiple
              accept={props.accept.join(',')}
              name={field.name}
              onBlur={field.onBlur}
              ref={field.ref}
              className="h-10 py-0"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                field.onChange(picked);
                e.currentTarget.value = '';
              }}
            />

            <div className="mt-1 min-h-[16px]">
              {props.description ? (
                <FieldDescription className="text-xs">{props.description}</FieldDescription>
              ) : null}
            </div>

            {files.length > 0 ? (
              <ul className="mt-2 space-y-2 w-full">
                {files.map((f, idx) => (
                  <li
                    key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                    className="flex items-center gap-3 w-full"
                  >
                    <div className="min-w-0 w-0 flex-1">
                      <span className="block truncate" title={f.name}>
                        {f.name}
                      </span>
                      <div className="text-sm opacity-70">{formatBytes(f.size)}</div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 cursor-pointer"
                      onClick={() => field.onChange(files.filter((_, i) => i !== idx))}
                      aria-label="Quitar archivo"
                    >
                      <X />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {fieldState.invalid ? (
              <div className="mt-1">
                <FieldError
                  errors={(Array.isArray(fieldState.error) ? fieldState.error : [fieldState.error])
                    .filter(Boolean)
                    .slice(0, 3)}
                />
              </div>
            ) : null}
          </Field>
        );
      }}
    />
  );
}
