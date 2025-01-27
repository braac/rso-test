// app/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseAuthRedirect } from '@/services/auth-service';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (window.location.hash) {
        const authData = parseAuthRedirect(window.location.hash);
        sessionStorage.setItem('riotAuthData', JSON.stringify(authData));
        router.push('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/?error=auth_failed');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-4">
        <h1 className="text-xl font-semibold mb-2">Processing Authentication</h1>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}