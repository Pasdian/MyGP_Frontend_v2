export type VerifySession = {
  user: {
    uuid: string;
    name: string;
    casa_user_name: string;
    email: string;
    mobile: string;
    status: string;
    company_name: string | null;
    company_uuid: string | null;
    company_casa_id: string | null;
  };
  role: {
    name: string;
    description: string;
  };
  modules: string[];
  iat: number;
  exp: number;
};
