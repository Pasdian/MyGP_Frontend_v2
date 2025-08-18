// Do not rename, modify or delete any event alias
// Recommended event naming convention: <module>_<action>_EVENT

interface TransbelEvent {
  id: number;
  alias: "TRANSBEL_MODIFY_DELIVERY" | "TRANSBEL_MODIFY_INTERFACE";
  eventName: string;
  description: string;
}

interface RoleEvent {
  id: number;
  alias: "ROLES_ADD_ROLE" | "ROLES_MODIFY_ROLE";
  eventName: string;
  description: string;
}

interface UserEvent {
  id: number;
  alias: "USERS_ADD_USER" | "USERS_MODIFY_USER" | "USERS_DELETE_USER";
  eventName: string;
  description: string;
}

interface CompanyEvent {
  id: number;
  alias: "COMPANY_ADD_COMPANY" | "COMPANY_MODIFY_COMPANY";
  eventName: string;
  description: string;
}

interface ModuleEvent {
  id: number;
  alias: "MODULE_ADD_MODULE" | "MODULE_MODIFY_MODULE";
  eventName: string;
  description: string;
}

interface DEAEvent {
  id: number;
  alias:
    | "DEA_DIGITAL_RECORD"
    | "DEA_DOWNLOAD_FILE"
    | "DEA_DELETE_FILE"
    | "DEA_UPLOAD_FILE";
  eventName: string;
  description: string;
}

export const transbelModuleEvents: TransbelEvent[] = [
  {
    id: 1,
    alias: "TRANSBEL_MODIFY_DELIVERY",
    eventName: "TRANSBEL_MODIFY_DELIVERY_EVENT",
    description: "Usuario modifica una entrega dentro del módulo de transbel",
  },
  {
    id: 2,
    alias: "TRANSBEL_MODIFY_INTERFACE",
    eventName: "TRANSBEL_MODIFY_INTERFACE_EVENT",
    description: "Usuario modifica interfaz dentro del módulo de transbel",
  },
];

export const usersModuleEvents: UserEvent[] = [
  {
    id: 1,
    alias: "USERS_ADD_USER",
    eventName: "USERS_ADD_USER_EVENT",
    description: "Usuario añade a un usuario dentro del módulo de usuarios",
  },
  {
    id: 2,
    alias: "USERS_MODIFY_USER",
    eventName: "USERS_MODIFY_USER_EVENT",
    description: "Usuario modifica a un usuario dentro del módulo de usuarios",
  },
  {
    id: 3,
    alias: "USERS_DELETE_USER",
    eventName: "USERS_DELETE_USER_EVENT",
    description: "Usuario elimina a un usuario dentro del módulo de usuarios",
  },
];

export const rolesModuleEvents: RoleEvent[] = [
  {
    id: 1,
    alias: "ROLES_ADD_ROLE",
    eventName: "ROLES_ADD_ROLE_EVENT",
    description: "Usuario añade un nuevo rol dentro del módulo de roles",
  },
  {
    id: 2,
    alias: "ROLES_MODIFY_ROLE",
    eventName: "ROLES_MODIFY_ROLE_EVENT",
    description: "Usuario modifica un rol dentro del módulo de roles",
  },
];

export const companyModuleEvents: CompanyEvent[] = [
  {
    id: 1,
    alias: "COMPANY_ADD_COMPANY",
    eventName: "COMPANY_ADD_COMPANY_EVENT",
    description: "Usuario añade una nueva compañia en el módulo de compañias",
  },
  {
    id: 2,
    alias: "COMPANY_MODIFY_COMPANY",
    eventName: "COMPANY_MODIFY_COMPANY_EVENT",
    description: "Usuario modifica una compañia en el módulo de compañias",
  },
];

export const moduleModuleEvents: ModuleEvent[] = [
  {
    id: 1,
    alias: "MODULE_ADD_MODULE",
    eventName: "MODULE_ADD_MODULE_EVENT",
    description: "Usuario añade un nuevo módulo",
  },
  {
    id: 2,
    alias: "MODULE_MODIFY_MODULE",
    eventName: "MODULE_MODIFY_MODULE_EVENT",
    description: "Usuario modifica un módulu",
  },
];

export const deaModuleEvents: DEAEvent[] = [
  {
    id: 1,
    alias: "DEA_DIGITAL_RECORD",
    eventName: "DEA_DIGITAL_RECORD_EVENT",
    description: "Usuario genera un expediente digital para una referencia",
  },
  {
    id: 2,
    alias: "DEA_UPLOAD_FILE",
    eventName: "DEA_UPLOAD_FILE_EVENT",
    description: "Usuario sube un archivo al DEA",
  },
  {
    id: 3,
    alias: "DEA_DELETE_FILE",
    eventName: "DEA_DELETE_FILE_EVENT",
    description: "Usuario borra un archivo del DEA",
  },
  {
    id: 4,
    alias: "DEA_DOWNLOAD_FILE",
    eventName: "DEA_DOWNLOAD_FILE_EVENT",
    description: "Usuario descarga un archivo del DEA",
  },
];
