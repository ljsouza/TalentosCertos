import { createClient } from "@supabase/supabase-js";

// Next.js expõe env vars públicas via NEXT_PUBLIC_*.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enquanto as env vars não existem (v0 inicial), a camada src/data/* cai no mock.
export const supabaseEnabled = Boolean(url && anonKey);

// Cliente para leitura pública (Server Components). Auth com cookies via
// @supabase/ssr entra na v1.0, junto com as áreas logadas.
export const supabase = supabaseEnabled
  ? createClient(url as string, anonKey as string)
  : null;
