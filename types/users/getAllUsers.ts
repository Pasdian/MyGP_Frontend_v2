export type getAllUsers = {
  id: number | null;
  user_uuid: string | null;
  name: string | null;
  email: string | null;
  mobile: string | null;
  has_casa_user: boolean | null;
  casa_user_name: string | null | null;
  status: string | null;
  role_uuid: number | null;
  created_at: string | null;
  updated_at: string | null;
  role: {
    id: number | null;
    name: string | null;
    description: string | null;
    uuid: string | null;
  };
  companies:
    | {
        uuid: string | null;
        name: string | null;
        casa_id: string | null;
      }[]
    | null;
};
