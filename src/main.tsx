import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testSupabaseConnection } from './lib/supabaseTest';

// Run Supabase connection test on startup (safe — no secrets logged)
testSupabaseConnection().then((result) => {
  console.log('[Supabase] Connection test result:', {
    clientOk: result.clientOk,
    dbOk: result.dbOk,
    tablesFound: result.tablesFound,
    ...(result.error ? { note: result.error } : {}),
  });
});

createRoot(document.getElementById('root')!).render(<App />);
