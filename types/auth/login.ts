import Module from 'module';
import { User } from '../permissions/user';
import { Role } from '../permissions/role';

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
