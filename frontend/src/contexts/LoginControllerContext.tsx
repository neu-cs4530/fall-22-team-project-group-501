import React from 'react';
import TownController from '../classes/TownController';
import { TownsService } from '../generated/client';
import { SupabaseClient } from '@supabase/supabase-js';

export type LoginController = {
  setTownController: (newController: TownController | null) => void;
  setAuthClient: (newAuthClient: SupabaseClient | null) => void;


  townsService: TownsService;
  supabaseService: SupabaseClient;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useLoginController` hook.
 */
const context = React.createContext<LoginController | null>(null);

export default context;
