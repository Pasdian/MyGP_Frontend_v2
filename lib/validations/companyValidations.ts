import { z } from "zod/v4";

export const COMPANY_NAME_VALIDATION = z
  .string({
    error: "Ingresa el nombre de una compañia",
  })
  .min(3, {
    error: "El nombre de la compañia debe de ser de al menos 3 caracteres",
  })
  .toUpperCase();

export const COMPANY_CASA_ID_VALIDATION = z
  .string({ error: "Ingresa el ID CASA" })
  .min(1, {
    error: "El ID CASA debe de ser de mínimo 1 carácter",
  })
  .optional()
  .or(z.literal(""));
