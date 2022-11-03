export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user: {
        Row: {
          nickname: string | null
          email: string
          user_id: number
        }
        Insert: {
          nickname?: string | null
          email: string
          user_id?: number
        }
        Update: {
          nickname?: string | null
          email?: string
          user_id?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
