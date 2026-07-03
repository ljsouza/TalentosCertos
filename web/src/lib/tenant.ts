import { cache } from "react";
import { headers } from "next/headers";
import { supabase, supabaseEnabled } from "@/lib/supabase";

// ── Resolução de tenant (multi-tenant) ──────────────────────────────────────
// O proxy (src/proxy.ts) resolve o slug do tenant a partir do host e o propaga
// para a aplicação no header `x-tenant-slug`. A resolução slug → organização
// (com org_id) é feita aqui, na aplicação, e cacheada por request.
//
// Modos de entrada:
//   • Deploy MaringáPost  → TENANT_SLUG fixo por env (ex.: 'maringapost').
//   • <slug>.talentoscertos.com.br → tenant daquela prefeitura.
//   • talentoscertos.com.br / www  → institucional (sem tenant → slug vazio).

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "talentoscertos.com.br";
const DEFAULT_TENANT = process.env.TENANT_SLUG ?? "maringapost";

export const TENANT_HEADER = "x-tenant-slug";

export type Organizacao = {
  id: string;
  slug: string;
  nome: string;
  tipo: "parceiro" | "prefeitura";
  base_path: string | null;
  dominio: string | null;
  branding: Record<string, unknown>;
  status: string;
};

// Puro (usado no proxy, sem acesso a DB): deduz o slug do tenant a partir do
// host. Retorna "" quando é o institucional (apex/www). Um deploy com tenant
// fixo (TENANT_SLUG) sempre devolve esse slug.
export function tenantSlugFromHost(host: string | null | undefined): string {
  if (process.env.TENANT_SLUG) return process.env.TENANT_SLUG;
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  if (!hostname) return DEFAULT_TENANT;

  const rootSuffix = `.${ROOT_DOMAIN}`;
  if (hostname.endsWith(rootSuffix)) {
    const sub = hostname.slice(0, -rootSuffix.length);
    return sub && sub !== "www" ? sub : ""; // sub vazio/www → institucional
  }
  if (hostname === ROOT_DOMAIN) return ""; // apex → institucional

  // Dev: suporta cidade.localhost; localhost puro cai no tenant default.
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : "";
  }
  return DEFAULT_TENANT;
}

// Slug do tenant corrente, lido do header propagado pelo proxy. "" = institucional.
export async function getTenantSlug(): Promise<string> {
  const h = await headers();
  return h.get(TENANT_HEADER) ?? "";
}

// Organização corrente (cacheada por request). null = institucional ou mock.
export const getTenant = cache(async (): Promise<Organizacao | null> => {
  const slug = await getTenantSlug();
  if (!slug) return null;
  if (!supabaseEnabled || !supabase) return null; // modo mock (sem Supabase)
  const { data } = await supabase
    .from("organizacoes")
    .select("id,slug,nome,tipo,base_path,dominio,branding,status")
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as Organizacao) ?? null;
});

// org_id do tenant corrente (para filtrar leituras públicas por tenant).
export async function currentOrgId(): Promise<string | null> {
  const t = await getTenant();
  return t?.id ?? null;
}
