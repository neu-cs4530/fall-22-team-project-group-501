import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdootllbkurfvmpootdk.supabase.co';
if (!process.env.SUPABASE_KEY) {
  throw new Error('DB Key not provided. Cannot connect to db');
}
export default createClient(SUPABASE_URL, process.env.SUPABASE_KEY);
