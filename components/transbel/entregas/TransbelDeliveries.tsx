'use client';
import React from 'react';
import TransbelDeliveriesDT from './TransbelDeliveriesDT';
import { transbelDeliveriesCD } from './columnDefs/transbelDeliveriesCD';
import { Deliveries } from '@/app/transbel/entregas/page';

export default function TransbelDeliveries({ data }: { data: Deliveries[] }) {
  return (
    <div>
      <TransbelDeliveriesDT data={data} columns={transbelDeliveriesCD} />
    </div>
  );
}
