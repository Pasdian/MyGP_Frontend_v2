import { EmbarqueContext } from "@/contexts/EmbarqueContext";
import React from "react";

export function useEmbarque() {
  const context = React.useContext(EmbarqueContext);
  if (!context) {
    throw new Error("useEmbarque must be used within an EmbarqueProvider");
  }
  return context;
}