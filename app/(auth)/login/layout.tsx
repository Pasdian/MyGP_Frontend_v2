import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/getServerSession';

export default async function LoginLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  // Already authenticate, don't let them see login
  if (session) {
    redirect('/mygp/dashboard');
  }

  return <>{children}</>;
}
