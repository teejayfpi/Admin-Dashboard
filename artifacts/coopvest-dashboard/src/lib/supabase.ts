import { createClient } from "@supabase/supabase-js";

// Use window.ENV_VITE_* from Vite build-time injection, fallback to import.meta.env
const supabaseUrl = (window as any).ENV_VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (window as any).ENV_VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate required environment variables - show warning in console but don't crash
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[Coopvest Dashboard] Missing Supabase environment variables. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.");
}

// Create client only if credentials exist, otherwise use null
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
