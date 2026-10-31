import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in your .env file.'
  );
}

// Verify URL format without logging secrets
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('[Supabase] VITE_SUPABASE_URL must start with https://');
}

console.log('[Supabase] Client initializing for project:', supabaseUrl.split('.')[0].replace('https://', ''));

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

