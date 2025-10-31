import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

// Server-side Supabase client with service role key
export const createSupabaseServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!serviceKey) {
    console.warn('Service role key not set');
    return supabase;
  }
  
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};



