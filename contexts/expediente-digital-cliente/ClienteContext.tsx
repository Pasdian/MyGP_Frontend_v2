'use client';

import React from 'react';

type ClienteContextType = {
  cliente: string;
  casa_id: string;
  setCliente: (label: string) => void;
  setCasaId: (value: string) => void;
};

const ClienteContext = React.createContext<ClienteContextType | undefined>(undefined);

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = React.useState('');
  const [casa_id, setCasaId] = React.useState('');

  return (
    <ClienteContext.Provider value={{ cliente, casa_id, setCliente, setCasaId }}>
      {children}
    </ClienteContext.Provider>
  );
}

export function useCliente() {
  const context = React.useContext(ClienteContext);
  if (!context) {
    throw new Error('useCliente must be used within ClienteProvider');
  }
  return context;
}
