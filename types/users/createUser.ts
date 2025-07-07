export type CreateUser = {
  name: string | null;
  email: string | null;
  password: string | null;
  role_id: number;
  mobile: string;
  has_casa_user: boolean;
  casa_user_name: string;
};
