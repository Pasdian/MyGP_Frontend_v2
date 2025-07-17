import { z } from "zod/v4";
import {
  ROLE_DESCRIPTION_VALIDATION,
  ROLE_NAME_VALIDATION,
} from "@/lib/validations/roleValidations";

export const addRoleSchema = z.object({
  name: ROLE_NAME_VALIDATION,
  description: ROLE_DESCRIPTION_VALIDATION,
});
