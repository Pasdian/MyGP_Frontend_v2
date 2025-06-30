export type VerifySession = {
  id: number;
  uuid: string;
  casa_user_name: string | null;
  name: string;
  email: string;
  role: number;
  iat: number;
  exp: number;
};
