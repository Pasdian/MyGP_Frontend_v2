import {
  MODULE_ALIAS_VALIDATION,
  MODULE_DESCRIPTION_VALIDATION,
  MODULE_NAME_VALIDATION,
} from "@/lib/validations/moduleValidations";
import { z } from "zod/v4";

export const moduleSchema = z.object({
  name: MODULE_NAME_VALIDATION,
  description: MODULE_DESCRIPTION_VALIDATION,
  alias: MODULE_ALIAS_VALIDATION,
});
