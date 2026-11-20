import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Cliente Supabase de uso público / anônimo (totens e tablets).
 * Apenas possui permissão para INSERT na tabela oficial.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Cliente Supabase Administrativo (apenas no lado do servidor).
 * Utilizado pelos Route Handlers protegidos para consultas e consolidação de relatórios.
 * Se SUPABASE_SERVICE_ROLE_KEY não for configurada, usa a anon key com fallback controlado.
 */
export function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
