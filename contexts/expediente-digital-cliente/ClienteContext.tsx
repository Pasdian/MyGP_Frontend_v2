'use client';

import React from 'react';

type ClienteContextType = {
  cliente: string;
  setCliente: (value: string) => void;
};

const ClienteContext = React.createContext<ClienteContextType | undefined>(undefined);

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState('');

  return (
    <ClienteContext.Provider value={{ cliente, setCliente }}>{children}</ClienteContext.Provider>
  );
}

export function useCliente() {
  const context = React.useContext(ClienteContext);
  if (!context) {
    throw new Error('useCliente must be used within ClienteProvider');
  }
  return context;
}
