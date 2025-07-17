import {
  USER_CASA_USERNAME_VALIDATION,
  USER_EMAIL_VALIDATION,
  USER_HAS_CASA_USER_VALIDATION,
  USER_MOBILE_VALIDATION,
  USER_NAME_VALIDATION,
  USER_PASSWORD_VALIDATION,
  USER_ROLE_ID_VALIDATION,
} from "@/lib/validations/userValidations";

import { z } from "zod/v4";

export const addUserSchema = z
  .object({
    name: USER_NAME_VALIDATION,
    email: USER_EMAIL_VALIDATION,
    password: USER_PASSWORD_VALIDATION,
    confirm_password: USER_PASSWORD_VALIDATION,
    role_id: USER_ROLE_ID_VALIDATION,
    mobile: USER_MOBILE_VALIDATION,
    has_casa_user: USER_HAS_CASA_USER_VALIDATION,
    casa_user_name: USER_CASA_USERNAME_VALIDATION,
  })
  .refine((data) => data.password === data.confirm_password, {
    error: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });
