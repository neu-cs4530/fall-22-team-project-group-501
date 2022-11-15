import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../types/Supabase';



export default function getClient() {
  dotenv.config();

  const SUPABASE_URL = 'https://mdootllbkurfvmpootdk.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  if (!SUPABASE_KEY) {
    throw new Error('DB Key not provided. Cannot connect to db');
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_KEY)
}
