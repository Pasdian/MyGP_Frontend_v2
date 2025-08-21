import {
  USER_CASA_USERNAME_VALIDATION,
  USER_COMPANY_UUID_VALIDATION,
  USER_COMPANY_VALIDATION,
  USER_EMAIL_VALIDATION,
  USER_HAS_CASA_USER_VALIDATION,
  USER_MOBILE_VALIDATION,
  USER_NAME_VALIDATION,
  USER_OPTIONAL_PASSWORD_VALIDATION,
  USER_PASSWORD_VALIDATION,
  USER_ROLE_UUID_VALIDATION,
  USER_STATUS_VALIDATION,
} from "@/lib/validations/userValidations";

import { z } from "zod/v4";

export const addUserSchema = z
  .object({
    name: USER_NAME_VALIDATION,
    email: USER_EMAIL_VALIDATION,
    password: USER_PASSWORD_VALIDATION,
    confirm_password: USER_PASSWORD_VALIDATION,
    mobile: USER_MOBILE_VALIDATION,
    has_casa_user: USER_HAS_CASA_USER_VALIDATION,
    casa_user_name: USER_CASA_USERNAME_VALIDATION,
    role_uuid: USER_ROLE_UUID_VALIDATION,
    company_uuid: USER_COMPANY_UUID_VALIDATION,
  })
  .refine((data) => data.password === data.confirm_password, {
    error: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export const modifyUserSchema = z.object({
  name: USER_NAME_VALIDATION,
  email: USER_EMAIL_VALIDATION,
  mobile: USER_MOBILE_VALIDATION,
  password: USER_OPTIONAL_PASSWORD_VALIDATION,
  role_uuid: USER_ROLE_UUID_VALIDATION,
  casa_user_name: USER_CASA_USERNAME_VALIDATION,
  status: USER_STATUS_VALIDATION,
  company_uuid: USER_COMPANY_VALIDATION,
});
