// contexts/AllTransbelRefsContext.ts
'use client';

import { TransbelRef } from '@/types/transbel/TransbelRef';
import React from 'react';

export type AllTransbelRefsContextValue = {
  refs: TransbelRef[] | undefined;
  isLoading: boolean;
};

export const AllTransbelRefsContext = React.createContext<AllTransbelRefsContextValue | undefined>(
  undefined
);
