import { z } from "zod/v4";

export const NUM_REFE = z
  .string({ error: "Ingresa una referencia" })
  .min(3, { error: "La referencia debe de ser de mínimo 3 caracteres" });
export const CVE_ETAP = z
  .string({ error: "Selecciona una etapa a modificar" })
  .min(3, {
    error: "Selecciona una etapa de mínimo 3 caracteres",
  });
export const HOR_ETAP = z.iso.time({
  error: "La hora no tiene el formato especificado HH:mm",
  precision: -1,
});
export const FEC_ETAP = z.iso.date({
  error: "La fecha no tiene el formato específicado yyyy-mm-dd",
});
export const OBS_ETAP = z
  .string({ error: "Selecciona un código de excepción" })
  .min(3, {
    error: "El código de excepción debe de ser de mínimo 3 caracteres",
  })
  .optional();
export const CVE_MODI = z
  .string({ error: "Ingresa un usuario" })
  .min(2, { error: "El usuario debe de ser de mínimo de 2 carácteres" })
  .max(15, { error: "El usuario debe de ser de máximo de 15 carácteres" });
