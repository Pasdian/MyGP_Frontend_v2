import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Inter } from 'next/font/google';
import { DEAStoreProvider } from './providers/dea-store-provider';
import SWRProvider from './providers/SWRProvider';
import { VersionGate } from '@/components/VersionGate/VersionGate';

export const metadata: Metadata = {
  title: 'MyGP',
  description: 'MyGP Application',
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className="overflow-y-hidden">
      <body className={`${inter.className} overflow-y-hidden`}>
        <SWRProvider>
          <VersionGate />
          <DEAStoreProvider>{children}</DEAStoreProvider>
          <Toaster position="top-center" />
        </SWRProvider>
      </body>
    </html>
  );
}
