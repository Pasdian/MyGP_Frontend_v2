import { z } from 'zod';

export const INSTRUCCION_ADICIONAL_OTROS_VALUE = 'OTROS';

export const instruccionAdicionalConceptOptions = [
  {
    value: 'Captura Fact. COVE',
    label: 'Captura Fact. COVE',
  },
  {
    value: 'Servicio Extraordinario AA',
    label: 'Servicio Extraordinario AA',
  },
  {
    value: 'Colocación de Candados Fiscales en Transporte',
    label: 'Colocación de Candados Fiscales en Transporte',
  },
  {
    value: 'Firma Digital',
    label: 'Firma Digital',
  },
  {
    value: INSTRUCCION_ADICIONAL_OTROS_VALUE,
    label: 'Otro',
  },
] as const;

const importePattern = /^\d+(?:\.\d{1,2})?$/;
const cantidadPattern = /^\d+$/;

type CantidadValidationOptions = {
  allowZero?: boolean;
};

export function normalizeInstruccionConcepto(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getMatchingConceptOption(value?: string | null) {
  if (!value) return null;

  const normalizedValue = normalizeInstruccionConcepto(value);
  return (
    instruccionAdicionalConceptOptions.find(
      (option) =>
        option.value !== INSTRUCCION_ADICIONAL_OTROS_VALUE &&
        normalizeInstruccionConcepto(option.value) === normalizedValue
    ) || null
  );
}

export function resolveInstruccionAdicionalConcept(values: {
  concepto: string;
  otroConcepto?: string;
}) {
  if (values.concepto === INSTRUCCION_ADICIONAL_OTROS_VALUE) {
    return values.otroConcepto?.trim() || '';
  }

  return values.concepto.trim();
}

export function buildInstruccionAdicionalSchema(existingConceptos: string[] = []) {
  const reservedConceptos = new Set(
    existingConceptos.filter(Boolean).map(normalizeInstruccionConcepto)
  );
  const allowedConceptos = new Set<string>(
    instruccionAdicionalConceptOptions.map((option) => option.value)
  );

  return z
    .object({
      concepto: z.string().trim().min(1, 'El concepto es obligatorio'),
      otroConcepto: z.string().trim(),
      importe: z.string().trim().min(1, 'El importe es obligatorio'),
      cantidad: z.string().trim(),
    })
    .superRefine((data, ctx) => {
      if (!allowedConceptos.has(data.concepto)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['concepto'],
          message: 'Selecciona un concepto valido',
        });
      }

      const resolvedConcepto = resolveInstruccionAdicionalConcept(data);

      if (!resolvedConcepto) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path:
            data.concepto === INSTRUCCION_ADICIONAL_OTROS_VALUE ? ['otroConcepto'] : ['concepto'],
          message: 'El concepto es obligatorio',
        });
      } else {
        const normalizedConcepto = normalizeInstruccionConcepto(resolvedConcepto);

        if (reservedConceptos.has(normalizedConcepto)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path:
              data.concepto === INSTRUCCION_ADICIONAL_OTROS_VALUE ? ['otroConcepto'] : ['concepto'],
            message: 'Ese concepto ya existe en la referencia',
          });
        }

        if (resolvedConcepto.length > 120) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path:
              data.concepto === INSTRUCCION_ADICIONAL_OTROS_VALUE ? ['otroConcepto'] : ['concepto'],
            message: 'El concepto no puede exceder 120 caracteres',
          });
        }
      }

      const importeError = getInstruccionAdicionalImporteError(data.importe);
      if (importeError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['importe'],
          message: importeError,
        });
      }

      const cantidadError = getInstruccionAdicionalCantidadError(data.cantidad);
      if (cantidadError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cantidad'],
          message: cantidadError,
        });
      }
    });
}

export const instruccionAdicionalSchema = buildInstruccionAdicionalSchema();

export type InstruccionAdicionalFormValues = z.infer<typeof instruccionAdicionalSchema>;

export function getInstruccionAdicionalImporteError(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return 'El importe es obligatorio';
  if (!importePattern.test(trimmedValue)) {
    return 'Ingresa un importe valido con maximo 2 decimales';
  }

  return null;
}

export function getInstruccionAdicionalCantidadError(
  value: string,
  options: CantidadValidationOptions = {}
) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return null;
  if (!cantidadPattern.test(trimmedValue)) {
    return options.allowZero
      ? 'La cantidad debe ser un entero mayor o igual a 0'
      : 'La cantidad debe ser un entero positivo';
  }

  const numericValue = Number(trimmedValue);
  if (options.allowZero ? numericValue < 0 : numericValue <= 0) {
    return options.allowZero
      ? 'La cantidad no puede ser negativa'
      : 'La cantidad debe ser mayor a 0';
  }

  return null;
}

export function toInstruccionAdicionalInputValue(value?: number | string | null) {
  return value !== null && value !== undefined ? String(value) : '';
}

export function toInstruccionAdicionalFormDefaultValues(values?: {
  concepto?: string | null;
  importe?: number | string | null;
  cantidad?: number | string | null;
}): InstruccionAdicionalFormValues {
  const matchingOption = getMatchingConceptOption(values?.concepto);
  const hasExistingConcept = Boolean(values?.concepto?.trim());

  return {
    concepto:
      matchingOption?.value || (hasExistingConcept ? INSTRUCCION_ADICIONAL_OTROS_VALUE : ''),
    otroConcepto: matchingOption ? '' : values?.concepto?.trim() || '',
    importe:
      values?.importe !== null && values?.importe !== undefined ? String(values.importe) : '0',
    cantidad: toInstruccionAdicionalInputValue(values?.cantidad),
  };
}

export function toInstruccionAdicionalPayload(
  num_refe: string,
  values: InstruccionAdicionalFormValues
) {
  return {
    num_refe,
    concepto: resolveInstruccionAdicionalConcept(values),
    importe: Number(values.importe),
    cantidad: values.cantidad ? Number(values.cantidad) : null,
  };
}

export function toModificarInstruccionAdicionalPayload(
  uuid: string,
  num_refe: string,
  values: InstruccionAdicionalFormValues
) {
  return {
    uuid,
    ...toInstruccionAdicionalPayload(num_refe, values),
  };
}
