import { z } from "zod/v4";

export const USER_NAME_VALIDATION = z
  .string({ error: "Ingresa un usuario" })
  .min(2, { error: "El usuario debe de ser de mínimo de 2 caracteres" })
  .max(100, { error: "El usuario debe de ser de máximo de 100 caracteres" });

export const USER_CASA_USERNAME_VALIDATION = z
  .string({ error: "Ingresa un usuario" })
  .min(2, "El usuario CASA debe de ser de mínimo 2 caracteres")
  .max(8, "El usuario CASA debe de ser de máximo 8 caracteres")
  .toUpperCase()
  .optional()
  .or(z.literal(""));

export const USER_EMAIL_VALIDATION = z.email({ error: "Correo inválido" });

export const USER_MOBILE_VALIDATION = z
  .string()
  .regex(/^\d{10}$/, "El número de teléfono debe de ser de 10 dígitos")
  .optional()
  .or(z.literal(""));

export const USER_PASSWORD_VALIDATION = z
  .string()
  .min(8, { message: "La contraseña debe de ser mayor a 8 caracteres" });

export const USER_STATUS_VALIDATION = z.boolean();

export const USER_HAS_CASA_USER_VALIDATION = z.boolean();

export const USER_ROLE_ID_VALIDATION = z.string();

export const USER_OPTIONAL_PASSWORD_VALIDATION = z
  .string()
  .optional()
  .or(z.literal(""));
