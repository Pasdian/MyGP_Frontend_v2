import { z } from "zod/v4";

export const LOGIN_USER_VALIDATION = z
  .string()
  .email({ message: "Correo electrónico inválido" });

export const LOGIN_PASSWORD_VALIDATION = z
  .string()
  .min(8, { message: "La contraseña debe de ser mayor a 8 caracteres" });
