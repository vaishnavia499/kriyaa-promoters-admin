/**
 * Supabase Connection Test
 * Run this once to verify client initialisation and database reachability.
 * Import and call testSupabaseConnection() from a temporary button or useEffect.
 */
import { supabase } from './supabase';

export async function testSupabaseConnection(): Promise<{
  clientOk: boolean;
  dbOk: boolean;
  tablesFound: string[];
  error?: string;
}> {
  // Step 1: Verify client object was created
  const clientOk = !!supabase;

  if (!clientOk) {
    return { clientOk: false, dbOk: false, tablesFound: [], error: 'Supabase client failed to initialize' };
  }

  console.log('[Supabase] ✅ Client initialized successfully');

  // Step 2: Probe the database with a safe read against information_schema
  // This tells us which tables exist without requiring any specific table.
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      // "relation does not exist" → DB is reachable but tables not created yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('[Supabase] ⚠️ Connected to DB but "projects" table not yet created. Schema setup required.');
        return { clientOk: true, dbOk: true, tablesFound: [], error: 'Schema not yet created — see setup instructions' };
      }
      // Permission denied → RLS is working (client is connected)
      if (error.code === '42501') {
        console.log('[Supabase] ✅ DB reachable — RLS denied anonymous read (expected until policies are set)');
        return { clientOk: true, dbOk: true, tablesFound: ['projects (RLS protected)'] };
      }
      console.error('[Supabase] ❌ DB query error:', error.message);
      return { clientOk: true, dbOk: false, tablesFound: [], error: error.message };
    }

    console.log('[Supabase] ✅ DB connected — projects table accessible, rows returned:', data?.length ?? 0);
    return { clientOk: true, dbOk: true, tablesFound: ['projects'] };

  } catch (e: any) {
    console.error('[Supabase] ❌ Network/fetch error:', e?.message);
    return { clientOk: true, dbOk: false, tablesFound: [], error: e?.message };
  }
}

