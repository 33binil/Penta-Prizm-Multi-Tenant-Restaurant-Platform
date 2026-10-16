import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

if (config.supabase.url && config.supabase.anonKey) {
  try {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey);
    console.log('[Supabase] Initialized client for', config.supabase.url);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
  }
} else {
  console.log('[Supabase] Credentials not provided; operating in standalone repository mode.');
}

if (config.supabase.url && config.supabase.serviceRoleKey) {
  try {
    supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('[Supabase Admin] Initialized elevated service role client.');
  } catch (err) {
    console.warn('[Supabase Admin] Failed to initialize admin client:', err);
  }
}

export { supabaseClient, supabaseAdminClient };
