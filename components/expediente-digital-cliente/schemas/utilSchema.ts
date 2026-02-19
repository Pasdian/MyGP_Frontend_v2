import * as z from 'zod/v4';
import { addMonths, startOfDay, parseISO, isBefore } from 'date-fns';

// set now normalized
const now = new Date();
now.setHours(0, 0, 0, 0);
const oneMonthFromToday = addMonths(startOfDay(new Date()), 1);

// pdf schema
export const createPdfSchema = (maxSize: number) =>
  z
    .instanceof(File, { message: 'Archivo inválido' })
    .refine(
      (file) => file.size <= maxSize,
      `El archivo debe de ser de máximo ${maxSize / 1_000_000} MB`
    )
    .refine(
      (file) => ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type),
      'Solo se aceptan archivos .pdf .png .jpeg'
    )
    .optional();

// expiry date schema
export const expiryDateSchema = z
  .string()
  .min(1, 'Selecciona una fecha')
  .pipe(z.iso.date())
  .refine((value) => {
    const selected = parseISO(value); // always midnight
    return !isBefore(selected, oneMonthFromToday); // >= allowed
  }, 'Debe ser por lo menos un mes a partir de hoy')
  .optional();

export const buildHaciendaSchema = (certSize: number, efirmaSize: number, constanciaSize: number) =>
  z.object({
    certificado: z
      .object({
        file: z
          .instanceof(File, { message: 'Archivo inválido' })
          .refine(
            (file) => file.size <= certSize,
            `El certificado debe ser de máximo ${certSize / 1_000_000} MB`
          )
          .refine(
            (file) =>
              [
                'application/x-x509-ca-cert',
                'application/pkix-cert',
                'application/octet-stream',
                'application/vnd.apple.keynote',
              ].includes(file.type),
            'El certificado debe ser un archivo .cer válido'
          )
          .refine(
            (file) => file.name.toLowerCase().endsWith('.cer'),
            'El certificado debe tener extensión .cer'
          )
          .optional(),
      })
      .optional(),

    efirma: z
      .object({
        file: z
          .instanceof(File, { message: 'Archivo inválido' })
          .refine(
            (file) => file.size <= efirmaSize,
            `La e-firma debe ser de máximo ${efirmaSize / 1_000_000} MB`
          )
          .refine(
            (file) => file.name.toLowerCase().endsWith('.key'),
            'La e-firma debe tener extensión .key'
          )
          .optional(),
      })
      .optional(),

    constancia: z
      .object({
        file: createPdfSchema(constanciaSize),
      })
      .optional(),
  });
