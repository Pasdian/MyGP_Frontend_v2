import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - MyGP',
  description: 'Login to MyGP Application',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
