'use client';

// components/riot-auth/AuthStatus.tsx
import { AuthState } from '@/types/riot-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthStatusProps {
  authState: AuthState;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthStatus({ authState, onLogin, onLogout }: AuthStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riot Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={authState.isAuthenticated ? onLogout : onLogin} 
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
  );
}