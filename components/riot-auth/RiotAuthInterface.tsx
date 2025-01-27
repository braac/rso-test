'use client';

// components/riot-auth/RiotAuthInterface.tsx
import { useState, useEffect } from 'react';
import { AuthState } from '@/types/riot-auth';
import { AuthStatus } from './AuthStatus';
import { ApiTesting } from './ApiTesting';
import { parseAuthRedirect, getEntitlementToken, getRegion } from '@/services/auth-service';

export default function RiotAuthInterface() {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: '',
    entitlementToken: '',
    idToken: '',
    isAuthenticated: false,
    error: '',
    loading: false,
    region: '',
    shard: '',
    puuid: ''
  });

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }
  }, []);

  const handleAuthCallback = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const authData = parseAuthRedirect(window.location.hash);
      const entitlementToken = await getEntitlementToken(authData.accessToken);
      const regionInfo = await getRegion(authData.accessToken, authData.idToken);
      
      setAuthState(prev => ({
        ...prev,
        accessToken: authData.accessToken,
        entitlementToken,
        idToken: authData.idToken,
        puuid: authData.puuid,
        region: regionInfo.region,
        shard: regionInfo.shard,
        isAuthenticated: true,
        loading: false
      }));

      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };

// Update the handleLogin function in RiotAuthInterface.tsx
const handleLogin = () => {
  const authUrl = 'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';
  window.location.href = authUrl;
};

  const handleLogout = () => {
    setAuthState({
      accessToken: '',
      entitlementToken: '',
      idToken: '',
      isAuthenticated: false,
      error: '',
      loading: false,
      region: '',
      shard: '',
      puuid: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <AuthStatus 
        authState={authState}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {authState.isAuthenticated && (
        <ApiTesting authState={authState} />
      )}
    </div>
  );
}