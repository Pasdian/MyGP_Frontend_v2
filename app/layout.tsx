import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import localFont from 'next/font/local';
import { DEAStoreProvider } from './providers/dea-store-provider';
import SWRProvider from './providers/SWRProvider';
import { VersionGate } from '@/components/VersionGate/VersionGate';

export const metadata: Metadata = {
  title: 'MyGP',
  description: 'MyGP Application',
};

const inter = localFont({
  src: [
    {
      path: './fonts/inter/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/inter/Inter-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/inter/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
