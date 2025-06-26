import { z } from "zod/v4";

export const REFERENCIA = z
  .string({ error: "Ingresa una referencia" })
  .min(3, { error: "La referencia debe de ser de mínimo 3 caracteres" });
export const EE__GE = z
  .string({ error: "Ingresa una entrega entrante" })
  .min(3, { error: "La entrega entrante debe de ser de mínimo 3 caracteres" });
export const ENTREGA_TRANSPORTE_138 = z.iso.date({
  error: "La fecha no tiene el formato específicado yyyy-mm-dd",
});
export const CE_138 = z.iso.date({
  error: "La fecha no tiene el formato específicado yyyy-mm-dd",
});
export const ENTREGA_CDP_140 = z.iso.date({
  error: "La fecha no tiene el formato específicado yyyy-mm-dd",
});
export const CE_140 = z.string().optional();
