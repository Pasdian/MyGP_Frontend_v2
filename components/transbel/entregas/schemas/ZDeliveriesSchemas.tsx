import { z } from 'zod';

export const ZUpdatePhaseSchema = z.object({
  NUM_REFE: z.string().min(3, { message: 'La referencia debe de ser de mínimo 3 caracteres' }),
  CVE_ETAP: z
    .string({ message: 'El C.E de la etapa debe de ser una cadena de caracteres' })
    .min(2, { message: 'El C.E de la etapa debe de ser de mínimo 2 caracteres' })
    .max(15, { message: 'El C.E de la etapa debe de ser de mínimo 15 caracteres' }),
  FEC_ETAP: z
    .string({ message: 'El fecha de la etapa debe de ser una cadena de caracteres' })
    .length(10, { message: 'Fecha incorrecta, utiliza el formato dd-mm-yyyy' }),
  HOR_ETAP: z
    .string({ message: 'La hora de la etapa debe de ser una cadena de caracteres' })
    .length(5, { message: 'Hora incorrecta, utiliza el formato hh:mm' }),
  OBS_ETAP: z
    .string({ message: 'Las observaciones deben de ser una cadena de caracteres' })
    .max(100, { message: 'Las observaciones deben de ser de máximo 100 caracteres' }),
  CVE_MODI: z
    .string({ message: 'El C.E Modi. deben de ser una cadena de caracteres' })
    .min(2, { message: 'El C.E Modi. debe de ser de mínimo de 2 carácteres' })
    .max(15, { message: 'El C.E Modi. debe de ser de máximo de 15 carácteres' }),
});

export const ZAddPhaseSchema = z.object({
  NUM_REFE: z.string().min(3, { message: 'La referencia debe de ser de mínimo 3 caracteres' }),
  CVE_ETAP: z
    .string({ message: 'El C.E de la etapa debe de ser una cadena de caracteres' })
    .min(2, { message: 'El C.E de la etapa debe de ser de mínimo 2 caracteres' })
    .max(15, { message: 'El C.E de la etapa debe de ser de mínimo 15 caracteres' }),
  OBS_ETAP: z
    .string({ message: 'Las observaciones deben de ser una cadena de caracteres' })
    .max(100, { message: 'Las observaciones deben de ser de máximo 100 caracteres' }),
  CVE_MODI: z
    .string({ message: 'El C.E Modi. deben de ser una cadena de caracteres' })
    .min(2, { message: 'El C.E Modi. debe de ser de mínimo de 2 carácteres' })
    .max(15, { message: 'El C.E Modi. debe de ser de máximo de 15 carácteres' }),
});
