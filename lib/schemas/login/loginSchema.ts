import { z } from "zod/v4";
import {
  LOGIN_PASSWORD_VALIDATION,
  LOGIN_USER_VALIDATION,
} from "@/lib/validations/loginValidations";
export const loginSchema = z.object({
  email: LOGIN_USER_VALIDATION,
  password: LOGIN_PASSWORD_VALIDATION,
});
