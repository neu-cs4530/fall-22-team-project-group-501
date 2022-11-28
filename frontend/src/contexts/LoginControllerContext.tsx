import { SupabaseClient } from '@supabase/supabase-js';
import React from 'react';
import TownController from '../classes/TownController';
import { TownsService, UsersService } from '../generated/client';

export type LoginController = {
  setTownController: (newController: TownController | null) => void;
  setAuthClient: (newAuthClient: SupabaseClient | null) => void;
  setToken: (token: string | undefined) => void;

  townsService: TownsService;
  usersService: UsersService;
  supabaseService: SupabaseClient;
};
/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useLoginController` hook.
 */
const context = React.createContext<LoginController | null>(null);

export default context;
