export type Login = {
  message: string | null;
  token: string | null;
  complete_user: {
    user: {
      uuid: string | null;
      name: string | null;
      casa_user_name: string | null;
      email: string | null;
      mobile: string | null;
      status: string | null;
      company_name: string | null;
      company_uuid: string | null;
      company_casa_id: string | null;
    };
    role:
      | {
          uuid: string;
          name: string;
          description: string;
          permissions: {
            action: string;
            description: string;
          };
        }[]
      | null;
    modules: string[] | null;
  };
};
