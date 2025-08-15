export interface LoginResponse {
  message: string;
  token: string;
  complete_user: CompleteUser;
}

interface CompleteUser {
  user: User;
  role: Role;
  modules: Module[];
}

interface User {
  uuid: string;
  name: string;
  casa_user_name: string;
  email: string;
  mobile: string;
  status: string;
  company_name: string | null;
  company_uuid: string;
  company_casa_id: string | null;
}

interface Role {
  uuid: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  action: string | null;
  description: string | null;
}

interface Module {
  name: string;
  description: string;
}
