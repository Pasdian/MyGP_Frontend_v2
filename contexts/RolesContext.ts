import { getRoles } from '@/types/roles/getRoles';
import React from 'react';

export const RolesContext = React.createContext<getRoles[] | undefined>(undefined);
