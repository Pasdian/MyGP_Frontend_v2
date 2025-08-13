export type getRolesWithModulesAndPermissions = {
  role: string;
  uuid: string;
  modules:
    | {
        name: string;
        uuid: string;
        permissions:
          | {
              uuid: string;
              action: string;
              description: string;
            }[]
          | null;
      }[]
    | null;
  users: {
    user_uuid: string;
    name: string;
    email: string;
  }[];
};
