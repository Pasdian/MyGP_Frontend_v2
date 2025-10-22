import { z } from "zod/v4";

import {
  DATE_VALIDATION,
  EXCEPTION_CODE_VALIDATION,
  PHASE_VALIDATION,
  REF_VALIDATION,
  TRANSPORTE_VALIDATION,
} from "@/lib/validations/phaseValidations";
import { USER_CASA_USERNAME_VALIDATION } from "@/lib/validations/userValidations";
import { businessDaysDiffWithHolidays } from "@/lib/utilityFunctions/businessDaysDiffWithHolidays";

export const deliveriesUpsertPhaseSchema = z
  .object({
    ref: REF_VALIDATION,
    phase: PHASE_VALIDATION,
    exceptionCode: EXCEPTION_CODE_VALIDATION,
    cdp: DATE_VALIDATION,
    user: USER_CASA_USERNAME_VALIDATION,
    transporte: TRANSPORTE_VALIDATION,
  })
  .refine(
    (data) => !(data.transporte && data.cdp && data.cdp < data.transporte),
    {
      message: "La fecha de CDP no puede ser menor a la fecha de entrega",
      path: ["cdp"],
    }
  )
  .refine(
    (data) => {
      if (!data.exceptionCode && data.transporte && data.cdp) {
        const diff = businessDaysDiffWithHolidays(
          new Date(data.transporte),
          new Date(data.cdp)
        );
        return diff <= 1; // Only allow if difference is less than or equal to 1
      }
      return true; // Passes if no condition is violated
    },
    {
      message:
        "Coloca un código de excepción, la diferencia entre la fecha de entrega de transporte y CDP es mayor a 1 día",
      path: ["cdp"],
    }
  );
