import { z } from "zod/v4";

export const REF_VALIDATION = z
  .string({ error: "Ingresa una referencia" })
  .min(3, { error: "Selecciona una referencia" });

export const PHASE_VALIDATION = z
  .string({ error: "Selecciona una etapa a modificar" })
  .min(3, {
    error: "Selecciona una etapa",
  });

export const DATE_VALIDATION = z.iso.date({
  error: "La fecha no tiene el formato específicado yyyy-mm-dd",
});

export const TIME_VALIDATION = z.iso.time({
  error: "La hora no tiene el formato especificado HH:mm",
  precision: -1,
});

export const TRANSPORTE_VALIDATION = z.iso
  .date({
    error: "La fecha no tiene el formato específicado",
  })
  .optional()
  .or(z.literal(""));

export const EXCEPTION_CODE_VALIDATION = z.string().optional();

export const USER_VALIDATION = z
  .string({ error: "Ingresa un usuario" })
  .min(2, { error: "El usuario debe de ser de mínimo de 2 carácteres" })
  .max(15, { error: "El usuario debe de ser de máximo de 15 carácteres" });
