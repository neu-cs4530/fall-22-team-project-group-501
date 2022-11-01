export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          user_id: number;
          nickname: string | null;
          email: string;
        };
        Insert: {
          user_id?: number;
          nickname?: string | null;
          email: string;
        };
        Update: {
          user_id?: number;
          nickname?: string | null;
          email?: string;
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
