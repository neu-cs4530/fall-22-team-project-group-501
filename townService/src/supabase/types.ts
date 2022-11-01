export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          id: number;
          user_id: number | null;
          oauth_provider: string | null;
          access_token: string | null;
          refresh_token: string | null;
          expiry_date: string | null;
        };
        Insert: {
          id?: number;
          user_id?: number | null;
          oauth_provider?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          expiry_date?: string | null;
        };
        Update: {
          id?: number;
          user_id?: number | null;
          oauth_provider?: string | null;
          access_token?: string | null;
          refresh_token?: string | null;
          expiry_date?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
