import { Permission } from '../permissions/permission';

export interface Role {
  uuid: string | null;
  name: string | null;
  description: string;
  permissions: Permission[];
}
