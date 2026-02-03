import {
  COMPANY_CASA_ID_VALIDATION,
  COMPANY_NAME_VALIDATION,
  COMPANY_UUID_VALIDATION,
} from "@/lib/validations/companyValidations";
import { z } from "zod/v4";

export const CompanySchema = z.object({
  CVE_IMP: COMPANY_UUID_VALIDATION,
  NOM_IMP: COMPANY_NAME_VALIDATION,
  casa_id: COMPANY_CASA_ID_VALIDATION,
});
