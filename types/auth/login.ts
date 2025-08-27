import { User } from '../permissions/user';

export interface LoginResponse {
  message: string;
  accessToken: string;
  complete_user: CompleteUser;
}

interface CompleteUser {
  user: User;
  role: Role;
  modules: Module[];
}

type Role = {
  uuid: string | null;
  name: string | null;
  description: string | null;
  permissions: Permission[] | null;
};

type Permission = {
  uuid: string | null;
  action: string | null;
  description: string | null;
  isChecked: boolean | null;
};

interface Module {
  name: string | null;
  description: string | null;
}
