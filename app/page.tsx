'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Root() {
  const router = useRouter();
  React.useEffect(() => {
    router.push('/mygp/dashboard');
  }, [router]);
}
