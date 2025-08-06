export type getAllUsers = {
  id: number;
  user_uuid: string;
  name: string;
  email: string;
  mobile: string;
  has_casa_user: boolean;
  casa_user_name: string | null;
  status: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    name: string;
    description: string;
  };
  company: {
    uuid: string;
    name: string;
  } | null;
};
