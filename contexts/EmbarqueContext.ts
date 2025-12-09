"use client"
import { Embarque } from '@/types/transbel/Embarque';
import React from 'react';

export const EmbarqueContext = React.createContext<
  | {
      embarque: Embarque[] | undefined,
      isLoading: boolean,
      addEmbarque: (nuevo: Partial<Embarque>) => Promise<Embarque>
    }
  | undefined
>(undefined);
