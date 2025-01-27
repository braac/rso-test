'use client';

// components/riot-auth/ApiTesting.tsx
import { ApiResponse, AuthState } from '@/types/riot-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { makeAuthenticatedRequest, getEndpoints } from '@/services/api-service';
import { useState } from 'react';

interface ApiTestingProps {
  authState: AuthState;
}

export function ApiTesting({ authState }: ApiTestingProps) {
  const [apiResponse, setApiResponse] = useState<ApiResponse>({
    data: null,
    error: '',
    loading: false
  });

  const handleRequest = async (endpoint: string) => {
    setApiResponse({ data: null, error: '', loading: true });
    
    try {
      const data = await makeAuthenticatedRequest(
        endpoint,
        authState.accessToken,
        authState.entitlementToken
      );
      setApiResponse({ data, error: '', loading: false });
    } catch (error) {
      setApiResponse({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      });
    }
  };

  const endpoints = getEndpoints(authState.shard, authState.puuid);

  return (
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
              <Button onClick={() => handleRequest(endpoints.playerInfo())}>
                Get Player Info
              </Button>
              <Button onClick={() => handleRequest(endpoints.matchHistory())}>
                Get Match History
              </Button>
              <Button onClick={() => handleRequest(endpoints.competitiveUpdates())}>
                Get Competitive Updates
              </Button>
              <Button onClick={() => handleRequest(endpoints.wallet())}>
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
  );
}