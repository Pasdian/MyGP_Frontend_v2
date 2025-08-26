import { Company } from '../company/company';

export interface User {
  uuid: string | null;
  name: string | null;
  casa_user_name: string;
  email: string | null;
  mobile: string | null;
  status: string | null;
  companies: Company[];
}
