export type getRoleModulesAndPermissions =
  | {
      uuid: string | null;
      name: string | null;
      users:
        | {
            name: string | null;
            email: string | null;
          }[]
        | null;
      modules:
        | {
            uuid: string | null;
            name: string | null;
            isChecked: boolean | null;
            permissions:
              | {
                  uuid: string | null;

                  action: string | null;
                  description: string | null;

                  isChecked: boolean | null;
                }[]
              | null;
          }[]
        | null;
    }[]
  | null;
