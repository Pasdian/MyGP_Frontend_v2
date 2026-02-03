'use client';
import { Phase } from '@/types/casa/Phase';
import React from 'react';

export const EtapasContext = React.createContext<
  | {
      etapas: Phase[] | undefined;
      isLoading: boolean;
      upsertEtapa: (data: {
        phase: string;
        date: Date;
        user: string;
        exceptionCode: string | undefined;
      }) => Promise<void>;
    }
  | undefined
>(undefined);
