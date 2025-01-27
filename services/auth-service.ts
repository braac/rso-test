// services/auth-service.ts

export const getEntitlementToken = async (accessToken: string): Promise<string> => {
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
  
  export const getRegion = async (token: string, idToken: string): Promise<{ region: string; shard: string }> => {
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
  
  export const parseAuthRedirect = (hashFragment: string) => {
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