'use client';
import { LoginForm } from '@/components/forms/login/LoginForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/mygp/dashboard');
  }, []);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
