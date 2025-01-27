// types/riot-auth.ts

export interface AuthState {
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
  
  export interface RequestBody {
    [key: string]: unknown;
  }
  
  export interface PlayerInfo {
    gameName: string;
    tagLine: string;
    card?: {
      small: string;
      large: string;
      wide: string;
    };
  }
  
  export interface MatchHistory {
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
  
  export interface CompetitiveUpdate {
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
  
  export interface Wallet {
    Balances: {
      [key: string]: number;
      VP: number;
      RadianitePoints: number;
    };
  }
  
  export type ApiResponseData = PlayerInfo | MatchHistory | CompetitiveUpdate | Wallet | null;
  
  export interface ApiResponse {
    data: ApiResponseData;
    error: string;
    loading: boolean;
  }