'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthState {
  accessToken: string;
  entitlementToken: string;
  idToken: string;
  isAuthenticated: boolean;
  error: string;
  loading: boolean;
  region: string;
  shard: string;
  puuid: string;
}

interface RequestBody {
  [key: string]: unknown;
}

interface PlayerInfo {
  gameName: string;
  tagLine: string;
  card?: {
    small: string;
    large: string;
    wide: string;
  };
}

interface MatchHistory {
  Subject: string;
  BeginIndex: number;
  EndIndex: number;
  Total: number;
  History: Array<{
    MatchID: string;
    GameStartTime: number;
    QueueID: string;
  }>;
}

interface CompetitiveUpdate {
  Version: number;
  Subject: string;
  Matches: Array<{
    MatchID: string;
    MapID: string;
    SeasonID: string;
    MatchStartTime: number;
    TierAfterUpdate: number;
    TierBeforeUpdate: number;
    RankedRatingAfterUpdate: number;
    RankedRatingBeforeUpdate: number;
    RankedRatingEarned: number;
    CompetitiveMovement: string;
  }>;
}

interface Wallet {
  Balances: {
    [key: string]: number;
    VP: number;
    RadianitePoints: number;
  };
}

type ApiResponseData = PlayerInfo | MatchHistory | CompetitiveUpdate | Wallet | null;

interface ApiResponse {
  data: ApiResponseData;
  error: string;
  loading: boolean;
}

const RiotAuthInterface: React.FC = () => {
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

  const [apiResponse, setApiResponse] = useState<ApiResponse>({
    data: null,
    error: '',
    loading: false
  });

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }
  }, []);

  const parseAuthRedirect = (hashFragment: string) => {
    const searchParams = new URLSearchParams(hashFragment.substring(1));
    const accessToken = searchParams.get('access_token');
    const idToken = searchParams.get('id_token');
    const expiresIn = searchParams.get('expires_in');

    if (!accessToken || !idToken || !expiresIn) {
      throw new Error('Missing required auth parameters');
    }

    const accessTokenParts = accessToken.split('.');
    if (accessTokenParts.length !== 3) {
      throw new Error('Invalid access token format');
    }

    const accessTokenData = JSON.parse(atob(accessTokenParts[1]));
    if (!accessTokenData.sub) {
      throw new Error('Invalid access token data');
    }

    return {
      accessToken,
      idToken,
      expiresAt: (Number(expiresIn) * 1000) + Date.now() - 60000,
      puuid: accessTokenData.sub
    };
  };

  const getEntitlementToken = async (accessToken: string): Promise<string> => {
    const response = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get entitlement token');
    }

    const data = await response.json();
    return data.entitlements_token;
  };

  const getRegion = async (token: string, idToken: string): Promise<{ region: string; shard: string }> => {
    const response = await fetch('https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': ''
      },
      body: JSON.stringify({ id_token: idToken })
    });

    if (!response.ok) {
      throw new Error('Failed to get region');
    }

    const data = await response.json();
    const region = data.affinities.live;
    
    const regionToShard: { [key: string]: string } = {
      'na': 'na',
      'latam': 'na',
      'br': 'na',
      'eu': 'eu',
      'ap': 'ap',
      'kr': 'kr'
    };

    return {
      region,
      shard: regionToShard[region] || region
    };
  };

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

  const handleLogin = () => {
    localStorage.setItem('authRedirectUrl', window.location.href);
    window.location.href = 'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';
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
    setApiResponse({
      data: null,
      error: '',
      loading: false
    });
  };

  const makeAuthenticatedRequest = async (
    endpoint: string, 
    method: string = 'GET', 
    body: RequestBody | null = null
  ) => {
    setApiResponse({ data: null, error: '', loading: true });
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'X-Riot-Entitlements-JWT': authState.entitlementToken,
          'X-Riot-ClientVersion': 'release-07.12-shipping-1-2398971',
          'X-Riot-ClientPlatform': btoa(JSON.stringify({
            "platformType": "PC",
            "platformOS": "Windows",
            "platformOSVersion": "10.0.19042.1.256.64bit",
            "platformChipset": "Unknown"
          })),
          'Content-Type': 'application/json'
        },
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();
      setApiResponse({
        data,
        error: '',
        loading: false
      });
    } catch (error) {
      setApiResponse({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      });
    }
  };

  const testEndpoints = {
    playerInfo: () => {
      const endpoint = `https://pd.${authState.shard}.a.pvp.net/name-service/v2/players/${authState.puuid}`;
      makeAuthenticatedRequest(endpoint);
    },
    matchHistory: () => {
      const endpoint = `https://pd.${authState.shard}.a.pvp.net/match-history/v1/history/${authState.puuid}?startIndex=0&endIndex=10`;
      makeAuthenticatedRequest(endpoint);
    },
    competitiveUpdates: () => {
      const endpoint = `https://pd.${authState.shard}.a.pvp.net/mmr/v1/players/${authState.puuid}/competitiveupdates?startIndex=0&endIndex=10`;
      makeAuthenticatedRequest(endpoint);
    },
    wallet: () => {
      const endpoint = `https://pd.${authState.shard}.a.pvp.net/store/v1/wallet/${authState.puuid}`;
      makeAuthenticatedRequest(endpoint);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Riot Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={authState.isAuthenticated ? handleLogout : handleLogin} 
            disabled={authState.loading}
            className="w-full"
          >
            {authState.loading ? 'Processing...' : 
             authState.isAuthenticated ? 'Logout' : 'Login with Riot'}
          </Button>

          {authState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authState.error}</AlertDescription>
            </Alert>
          )}

          {authState.isAuthenticated && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Authenticated! Region: {authState.region.toUpperCase()}, 
                Shard: {authState.shard.toUpperCase()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {authState.isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="endpoints">Test Endpoints</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
              
              <TabsContent value="endpoints" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={testEndpoints.playerInfo}>
                    Get Player Info
                  </Button>
                  <Button onClick={testEndpoints.matchHistory}>
                    Get Match History
                  </Button>
                  <Button onClick={testEndpoints.competitiveUpdates}>
                    Get Competitive Updates
                  </Button>
                  <Button onClick={testEndpoints.wallet}>
                    Get Wallet
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="response">
                {apiResponse.loading && <p>Loading...</p>}
                {apiResponse.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{apiResponse.error}</AlertDescription>
                  </Alert>
                )}
                {apiResponse.data && (
                  <pre className="bg-secondary p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(apiResponse.data, null, 2)}
                  </pre>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiotAuthInterface;