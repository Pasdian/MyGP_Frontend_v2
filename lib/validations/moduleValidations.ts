import { z } from "zod/v4";

export const MODULE_NAME_VALIDATION = z
  .string({
    error: "Ingresa el nombre de un módulo",
  })
  .min(3, {
    error: "El nombre del módulo debe de ser de al menos 3 caracteres",
  });

export const MODULE_DESCRIPTION_VALIDATION = z
  .string({ error: "Ingresa la descripción del módulo" })
  .min(3, {
    error: "La descripción del modulo debe de ser de al menos 3 caracteres ",
  });

export const MODULE_ALIAS_VALIDATION = z
  .string({ error: "Ingresa el alias del módulo" })
  .min(3, {
    error: "El alias del modulo debe de ser de al menos 3 caracteres ",
  })
  .toUpperCase()
  .trim();
