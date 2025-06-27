export type Login = {
  token: string;
  user: {
    id: number | null;
    uuid: string | null;
    casa_user_name: string | null;
    name: string | null;
    email: string | null;
    role: number | null;
  };
};