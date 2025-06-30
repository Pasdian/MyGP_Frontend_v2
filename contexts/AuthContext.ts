import { USER_ROLE } from '@/lib/roles/roles';
import { APIVerifySession } from '@/types/auth/apiVerifySession';
import { Login } from '@/types/auth/login';
import React from 'react';

export const AuthContext = React.createContext<APIVerifySession>({
  name: '',
  email: '',
  role: 0,
  casa_user_name: '',
});
