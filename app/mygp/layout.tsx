import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import MyGPFrame from './_frame';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { getServerSession } from '@/lib/auth/getServerSession';
import { VersionWatcherProvider } from '../providers/VersionWatcherProvider';

type Props = {
  children: ReactNode;
};

export default async function MyGPLayout({ children }: Props) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <AuthProvider initialUser={session} initialAccessToken={session.accessToken}>
      <VersionWatcherProvider>
        <MyGPFrame>{children}</MyGPFrame>
      </VersionWatcherProvider>
    </AuthProvider>
  );
}
