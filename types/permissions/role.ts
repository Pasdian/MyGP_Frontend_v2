import { Module } from './module';
import { Permission } from './permission';
import { User } from './user';

export type Role = {
  uuid: string | null;
  name: string | null;
  users: User[] | null;
  modules: Module[] | null;
  permissions: Permission[] | null;
};
