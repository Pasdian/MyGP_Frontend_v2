export type Login = {
  message: string;
  token: string;
  complete_user: {
    user: {
      uuid: string;
      name: string;
      casa_user_name: string;
      email: string;
      mobile: string;
      status: string;
      company_name: string;
      company_uuid: string;
      company_casa_id: string;
    };
    role: { name: string; description: string };
    modules: string[];
  };
};
