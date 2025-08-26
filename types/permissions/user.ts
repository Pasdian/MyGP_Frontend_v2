import { Company } from '../company/company';

export type User = {
  uuid: string | null;
  name: string | null;
  casa_user_name: string | null;
  email: string | null;
  mobile: string | null;
  status: string | null;
  companies: Company[];
};
