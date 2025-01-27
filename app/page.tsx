// app/page.tsx
'use client';

import RiotAuthInterface from '@/components/riot-auth/RiotAuthInterface';

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background">
      <RiotAuthInterface />
    </main>
  );
}