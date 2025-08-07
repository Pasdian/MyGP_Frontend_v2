import { z } from "zod/v4";

export const ROLE_NAME_VALIDATION = z
  .string({
    error: "Ingresa el nombre de un rol",
  })
  .min(3, { error: "El nombre del rol debe de ser de al menos 3 caracteres" })
  .toUpperCase();

export const ROLE_DESCRIPTION_VALIDATION = z
  .string({ error: "Ingresa la descripción del rol" })
  .min(3, {
    error: "La descripción del rol debe de ser de al menos 3 caracteres",
  });
