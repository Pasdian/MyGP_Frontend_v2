import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Roboto } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { DEAStoreProvider } from './providers/dea-store-provider';

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
        <AuthProvider>
          <DEAStoreProvider>{children}</DEAStoreProvider>
        </AuthProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
