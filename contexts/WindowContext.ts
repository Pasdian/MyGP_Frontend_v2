import React from 'react';

export const WindowContext = React.createContext<
  | {
      allowPointerEvents: boolean;
      setAllowPointerEvents: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | undefined
>(undefined);
