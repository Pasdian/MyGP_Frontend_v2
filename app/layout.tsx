import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Roboto } from 'next/font/google';
import { DEAStoreProvider } from './providers/dea-store-provider';
import SWRProvider from './providers/SWRProvider';
import { VersionGate } from '@/components/VersionGate/VersionGate';

export const metadata: Metadata = {
  title: 'MyGP',
  description: 'MyGP Application',
};

const roboto = Roboto({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={roboto.className}>
      <body>
        <SWRProvider>
          <VersionGate />
          <DEAStoreProvider>{children}</DEAStoreProvider>
          <Toaster position="top-center" />
        </SWRProvider>
      </body>
    </html>
  );
}
