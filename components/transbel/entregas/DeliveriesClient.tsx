'use client';

import React from 'react';
import AddPhase from './AddPhase';
import Deliveries from './Deliveries';
<<<<<<< miguel-dev
=======

export const DeliveriesContext = React.createContext<{
  setShouldFetch: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);
>>>>>>> main

export default function DeliveriesClient() {
  return (
    <div>
      <AddPhase />
      <Deliveries />
    </div>
  );
}
