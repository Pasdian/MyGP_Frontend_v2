'use client';
import { Embarque } from '@/types/transbel/Embarque';
import React from 'react';

export type UpdateEmbarqueInput = {
  NUM_REFE: string;
  EE?: string;
  GE?: string;
  CECO?: string;
  CUENTA: string;
};
export const EmbarqueContext = React.createContext<
  | {
      embarque: Embarque[] | undefined;
      isLoading: boolean;
      updateEmbarque: (input: UpdateEmbarqueInput) => Promise<void>;
    }
  | undefined
>(undefined);
