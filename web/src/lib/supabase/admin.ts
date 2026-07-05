import { createClient } from "@supabase/supabase-js";

// Cliente service-role — SERVER ONLY. Bypassa RLS. Usar apenas em Route Handlers
// e Server Actions para lookups de notificação (e-mail de usuários em auth.users,
// que a RLS do anon não expõe). NUNCA importar em componentes cliente.
// Sem SUPABASE_SERVICE_ROLE_KEY → retorna null (notificações degradam para no-op).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
