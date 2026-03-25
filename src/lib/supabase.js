import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url-here' || supabaseAnonKey === 'your-anon-key-here') {
  console.warn(
    'Supabase environment variables are missing or use placeholders. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
