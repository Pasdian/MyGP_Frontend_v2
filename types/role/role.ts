import { Permission } from '../permission/permission';

export interface Role {
  uuid: string | null;
  name: string | null;
  description: string;
  permissions: Permission[];
}
