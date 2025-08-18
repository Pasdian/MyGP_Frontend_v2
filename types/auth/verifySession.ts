export type VerifySession = {
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
  role: {
    name: string | null;
    description: string | null;
    permissions: {
      action: string | null;
      description: string | null;
    }[];
  };
  modules: string[] | null;
  iat: number | null;
  exp: number | null;
};
