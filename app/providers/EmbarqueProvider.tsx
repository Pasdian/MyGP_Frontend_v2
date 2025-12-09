"use client"

import { EmbarqueContext } from "@/contexts/EmbarqueContext";
import { useEmbarqueData } from "@/hooks/useEmbarque/useEmbarqueData";

export default function EmbarqueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useEmbarqueData();

  return (
    <EmbarqueContext.Provider value={value}>
      {children}
    </EmbarqueContext.Provider>
  );
}