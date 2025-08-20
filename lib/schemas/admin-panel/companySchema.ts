import {
  COMPANY_CASA_ID_VALIDATION,
  COMPANY_NAME_VALIDATION,
} from "@/lib/validations/companyValidations";
import { z } from "zod/v4";

export const companySchema = z.object({
  name: COMPANY_NAME_VALIDATION,
  casa_id: COMPANY_CASA_ID_VALIDATION,
});
