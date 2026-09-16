import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

// Ensure the URL does not include /rest/v1 so auth endpoints resolve correctly
if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1', '');
} else if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.replace('/rest/v1/', '');
}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
