import { Module } from './module';
import { User } from './user';

export type Role = {
  uuid: string | null;
  name: string | null;
  users: User[] | null;
  modules: Module[] | null;
  permissions: Permission[] | null;
};

interface Permission {
  uuid: string | null;
  action: string | null;
  description: string | null;
  isChecked: boolean;
}
