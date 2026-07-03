import { supabase, supabaseEnabled } from "@/lib/supabase";
import { currentOrgId } from "@/lib/tenant";
import type { PublicacaoComEmpresa } from "@/data/types";

const SELECT = "*, empresa:empresas(id,nome)";

const MOCK: PublicacaoComEmpresa[] = [
  {
    id: "pub1", empresa_id: null, chapeu: "Mercado de trabalho",
    titulo: "Energia solar cresce 40% em Maringá e região",
    lead: "Expansão das usinas fotovoltaicas abre disputa por profissionais.",
    categoria: "Reportagem", corpo: ["Texto de exemplo."], img_url: null, keywords: ["solar"],
    status: "aprovada", motivo: null, publicado_em: "2026-06-10", empresa: null,
  },
];

export async function getPublicacoes(): Promise<PublicacaoComEmpresa[]> {
  if (!supabaseEnabled || !supabase) return MOCK;
  const orgId = await currentOrgId();
  let query = supabase.from("publicacoes").select(SELECT).eq("status", "aprovada");
  if (orgId) query = query.eq("org_id", orgId);
  const { data, error } = await query.order("publicado_em", { ascending: false });
  if (error) throw error;
  return data as unknown as PublicacaoComEmpresa[];
}

export async function pubById(id: string): Promise<PublicacaoComEmpresa | null> {
  if (!supabaseEnabled || !supabase) return MOCK.find((p) => p.id === id) ?? null;
  const orgId = await currentOrgId();
  let query = supabase.from("publicacoes").select(SELECT).eq("id", id);
  if (orgId) query = query.eq("org_id", orgId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as unknown as PublicacaoComEmpresa) ?? null;
}

// Tempo de leitura estimado (~200 palavras/min) a partir do corpo —
// substitui o campo "tempo" do protótipo, que não existe no schema.
export function tempoLeitura(corpo: string[]): string {
  const palavras = corpo.join(" ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(palavras / 200))} min`;
}
