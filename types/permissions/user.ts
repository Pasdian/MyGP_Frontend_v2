import { Company } from '../company/company';

export type User = {
  name: string | null;
  email: string | null;
  companies: Company[];
};
