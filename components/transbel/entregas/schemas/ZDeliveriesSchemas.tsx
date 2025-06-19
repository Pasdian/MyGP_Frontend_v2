import { z } from 'zod/v4';

export const ZUpdatePhaseSchema = z.object({
  NUM_REFE: z.string().min(3, { message: 'La referencia debe de ser de mínimo 3 caracteres' }),
  CVE_ETAP: z
    .string({ message: 'El C.E de la etapa debe de ser una cadena de caracteres' })
    .min(2, { message: 'El C.E de la etapa debe de ser de mínimo 2 caracteres' })
    .max(15, { message: 'El C.E de la etapa debe de ser de mínimo 15 caracteres' }),
  HOR_ETAP: z.iso.time({
    error: 'La hora no tiene el formato especificado HH:mm',
    precision: -1,
  }),
  FEC_ETAP: z.iso.date({ error: 'La fecha no tiene el formato específicado yyyy-mm-dd' }),
  OBS_ETAP: z
    .string({ message: 'Las observaciones deben de ser una cadena de caracteres' })
    .max(100, { message: 'Las observaciones deben de ser de máximo 100 caracteres' }),
  CVE_MODI: z
    .string({ message: 'El usuario deben de ser una cadena de caracteres' })
    .min(2, { message: 'El usuario debe de ser de mínimo de 2 carácteres' })
    .max(15, { message: 'El usuario debe de ser de máximo de 15 carácteres' }),
});
