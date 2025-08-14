import { Permission } from './permission';

export type Module = {
  uuid: string | null;
  name: string | null;
  alias: string | null;
  isChecked: boolean | null;
  permissions: Permission[] | null;
};
