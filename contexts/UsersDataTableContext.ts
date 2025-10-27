import { getAllUsers } from '@/types/users/getAllUsers';
import React from 'react';

export const UsersDataTableContext = React.createContext<{
  getAllUsers: getAllUsers[] | undefined;
  setAllUsers: React.Dispatch<React.SetStateAction<getAllUsers[]>>;
}>({
  getAllUsers: undefined,
  setAllUsers: () => {},
});
