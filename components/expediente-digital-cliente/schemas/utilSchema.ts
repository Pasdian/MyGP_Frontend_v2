import * as z from 'zod/v4';
import { addMonths, startOfDay, parseISO, isBefore } from 'date-fns';

// set now normalized
const now = new Date();
now.setHours(0, 0, 0, 0);
const oneMonthFromToday = addMonths(startOfDay(new Date()), 1);

// pdf schema
export const createPdfSchema = (maxSize: number) =>
  z
    .file({ message: 'Por favor ingresa un PDF' })
    .min(10_000, 'El archivo debe de ser de mínimo 10 KB')
    .max(maxSize, `El archivo debe de ser de máximo ${maxSize / 1_000_000} MB`)
    .mime('application/pdf', { message: 'Solo se aceptan archivos PDF' });

// expiry date schema
export const expiryDateSchema = z
  .string()
  .min(1, 'Selecciona una fecha')
  .pipe(z.iso.date())
  .refine((value) => {
    const selected = parseISO(value); // always midnight
    return !isBefore(selected, oneMonthFromToday); // >= allowed
  }, 'Debe ser por lo menos un mes a partir de hoy');

// hacienda Schema
export const haciendaSchema = {
  rfc: z.string().max(13, { error: 'El RFC es de máximo 13 caracteres' }).min(1, 'Ingresa un RFC'),

  certificado: z
    .file({ message: 'Por favor ingresa un PDF' })
    .max(2_000_000, 'El certificado debe ser máximo de 2MB')
    .mime(
      ['application/x-x509-ca-cert', 'application/pkix-cert', 'application/octet-stream'],
      'El certificado debe ser un archivo .cer válido'
    )
    .refine(
      (file) => file.name.toLowerCase().endsWith('.cer'),
      'El certificado debe tener extensión .cer'
    ),

  efirma: z
    .file({ message: 'Por favor ingresa un PDF' })
    .max(2_000_000, 'La e-firma debe ser máximo de 2MB')
    .mime(
      [
        'application/vnd.apple.keynote',
        'application/octet-stream',
        'application/x-pem-file',
        'application/pkcs8',
      ],
      'La e-firma debe ser un archivo .key válido'
    )
    .refine(
      (file) => file.name.toLowerCase().endsWith('.key'),
      'La e-firma debe tener extensión .key'
    ),

  constancia: createPdfSchema(5_000_000),
};
