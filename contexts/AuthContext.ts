import { Login } from '@/types/auth/login';
import { VerifySession } from '@/types/auth/verifySession';
import React from 'react';

export const AuthContext = React.createContext<VerifySession>({
  name: '',
  id: 0,
  uuid: '',
  email: '',
  role: 0,
  casa_user_name: '',
  iat: 0,
  exp: 0,
});
