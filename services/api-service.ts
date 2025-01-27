// services/api-service.ts
import { RequestBody } from '@/types/riot-auth';

export const makeAuthenticatedRequest = async (
  endpoint: string,
  accessToken: string,
  entitlementToken: string,
  method: string = 'GET',
  body: RequestBody | null = null
) => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Riot-Entitlements-JWT': entitlementToken,
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

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const getEndpoints = (shard: string, puuid: string) => ({
  playerInfo: () => 
    `https://pd.${shard}.a.pvp.net/name-service/v2/players/${puuid}`,
  matchHistory: () => 
    `https://pd.${shard}.a.pvp.net/match-history/v1/history/${puuid}?startIndex=0&endIndex=10`,
  competitiveUpdates: () => 
    `https://pd.${shard}.a.pvp.net/mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=10`,
  wallet: () => 
    `https://pd.${shard}.a.pvp.net/store/v1/wallet/${puuid}`
});