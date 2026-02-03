import { z } from "zod/v4";

export const FOLIO_VALIDATION = z.string();

export const REF_VALIDATION = z
  .string({ error: "Ingresa una referencia" })
  .min(3, { error: "Selecciona una referencia" });

export const PHASE_VALIDATION = z
  .string({ error: "Selecciona una etapa a modificar" })
  .min(3, {
    error: "Selecciona una etapa",
  });

export const DATE_VALIDATION = z.iso.date({
  error: "La fecha no tiene el formato específicado",
});

export const TIME_VALIDATION = z.iso.time({
  error: "La hora no tiene el formato especificado",
  precision: -1,
});

export const TRANSPORTE_VALIDATION = z.iso
  .date({
    error: "La fecha no tiene el formato específicado",
  })
  .optional()
  .or(z.literal(""));

export const OPTIONAL_DATE_VALIDATION = z.iso
  .date({
    error: "La fecha no tiene el formato específicado",
  })
  .optional()
  .or(z.literal(""));

export const EXCEPTION_CODE_VALIDATION = z
  .string()
  .optional()
  .or(z.literal(""));
