import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Database } from '../types/Supabase';

export default function getClient() {
  dotenv.config();

  const supabaseUrl = 'https://mdootllbkurfvmpootdk.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  if (!supabaseKey) {
    throw new Error('DB Key not provided. Cannot connect to db');
  }
  return createClient<Database>(supabaseUrl, supabaseKey);
}
