export interface Company {
  CVE_IMP: string;
  NOM_IMP: string;
}

export interface Permission {
  uuid: string;
  action: string;
  description: string;
}

export interface Module {
  uuid: string;
  name: string;
  description: string;
}

export interface Role {
  uuid: string;
  name: string;
  description: string;
  permissions: Permission[];
  modules: Module[];
}

export interface getAllUsers {
  user_uuid: string;
  name: string;
  casa_user_name: string;
  email: string;
  mobile: string | null;
  status: string;
  companies_uuids: string;
  role: Role;
  companies: Company[];
}
