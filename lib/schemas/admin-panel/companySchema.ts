import {
  COMPANY_CASA_ID_VALIDATION,
  COMPANY_NAME_VALIDATION,
  COMPANY_UUID_VALIDATION,
} from "@/lib/validations/companyValidations";
import { z } from "zod/v4";

export const CompanySchema = z.object({
  uuid: COMPANY_UUID_VALIDATION,
  name: COMPANY_NAME_VALIDATION,
  casa_id: COMPANY_CASA_ID_VALIDATION,
});
