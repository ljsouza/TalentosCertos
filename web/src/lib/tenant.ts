import { cache } from "react";
import { headers } from "next/headers";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { AREAS, CIDADES } from "@/lib/refs";

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

// Slug do tenant corrente. Deriva direto do header `host` (sempre presente em
// Server Components), em vez do header injetado pelo proxy — que, no `next start`
// (prod), não é lido de forma confiável por Server Components, só por Route
// Handlers. Cobre os dois modos: TENANT_SLUG fixo (deploy do parceiro/prefeitura)
// e subdomínio do SaaS. "" = institucional.
export async function getTenantSlug(): Promise<string> {
  const h = await headers();
  return tenantSlugFromHost(h.get("host"));
}

// Resolve o "alvo" do tenant a partir do host — UMA aplicação, tenant dinâmico:
//  • TENANT_SLUG (env) → override fixo (deploy dedicado a um tenant).
//  • <slug>.talentoscertos.com.br → por slug (subdomínio do SaaS).
//  • apex/www → institucional (null).
//  • qualquer outro host (domínio próprio: araucaria.pr.gov.br, maringapost.com.br)
//    → por `organizacoes.dominio` (custom domain).
function alvoTenant(host: string | null | undefined): { por: "slug" | "dominio"; valor: string } | null {
  if (process.env.TENANT_SLUG) return { por: "slug", valor: process.env.TENANT_SLUG };
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  if (!hostname) return { por: "slug", valor: DEFAULT_TENANT };

  const rootSuffix = `.${ROOT_DOMAIN}`;
  if (hostname.endsWith(rootSuffix)) {
    const sub = hostname.slice(0, -rootSuffix.length);
    return sub && sub !== "www" ? { por: "slug", valor: sub } : null;
  }
  if (hostname === ROOT_DOMAIN) return null;
  if (hostname === "localhost") return { por: "slug", valor: DEFAULT_TENANT };
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    return { por: "slug", valor: sub && sub !== "www" ? sub : DEFAULT_TENANT };
  }
  return { por: "dominio", valor: hostname };
}

// Organização corrente (cacheada por request). null = institucional ou mock.
// UMA aplicação resolve o tenant por subdomínio OU domínio próprio — sem env por tenant.
export const getTenant = cache(async (): Promise<Organizacao | null> => {
  const h = await headers();
  const alvo = alvoTenant(h.get("host"));
  if (!alvo) return null;
  if (!supabaseEnabled || !supabase) return null; // modo mock (sem Supabase)
  const { data } = await supabase
    .from("organizacoes")
    .select("id,slug,nome,tipo,base_path,dominio,branding,status")
    .eq(alvo.por, alvo.valor)
    .eq("status", "ativo")
    .maybeSingle();
  return (data as unknown as Organizacao) ?? null;
});

// org_id do tenant corrente (para filtrar leituras públicas por tenant).
export async function currentOrgId(): Promise<string | null> {
  const t = await getTenant();
  return t?.id ?? null;
}

// Taxonomias do tenant (áreas/cidades), com fallback para os defaults globais.
export async function getTaxonomias(): Promise<{ areas: string[]; cidades: string[] }> {
  const t = await getTenant();
  const b = (t?.branding ?? {}) as { areas?: unknown; cidades?: unknown };
  const areas = Array.isArray(b.areas) && b.areas.length ? (b.areas as string[]) : AREAS;
  const cidades = Array.isArray(b.cidades) && b.cidades.length ? (b.cidades as string[]) : CIDADES;
  return { areas, cidades };
}

// Identidade/copy do tenant (header, hero, footer). Defaults do MaringáPost.
export type Brand = {
  nome: string;
  regiao: string;
  heroTitle: string;
  heroSub: string;
  accent: string | null;
  logoWord: string;   // palavra principal do logo (ex.: "MaringáPost", "Araucária")
  logoTag: string;    // sufixo do logo (ex.: "Empregos")
  footerSobre: string;
};
export async function getBrand(): Promise<Brand> {
  const t = await getTenant();
  const b = (t?.branding ?? {}) as Record<string, string>;
  const nome = t?.nome ?? "MaringáPost Empregos";
  const regiao = b.regiao ?? "Maringá e região";
  // Deriva logo do nome ("Araucária Empregos" → "Araucária" + "Empregos").
  const logoWord = b.logo_word ?? (nome.replace(/\s*empregos$/i, "").trim() || nome);
  return {
    nome,
    regiao,
    heroTitle: b.hero_title ?? "O trabalho certo tem endereço aqui.",
    heroSub:
      b.hero_sub ??
      "Vagas verificadas, empresas que respondem e conteúdo de carreira — em um só lugar.",
    accent: b.accent ?? null,
    logoWord,
    logoTag: b.logo_tag ?? "Empregos",
    footerSobre: b.footer_sobre ?? `A plataforma de empregos de ${regiao}. Conectando talentos e empresas da região.`,
  };
}
