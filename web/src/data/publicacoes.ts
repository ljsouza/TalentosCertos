import { supabase, supabaseEnabled } from "@/lib/supabase";
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
  const { data, error } = await supabase
    .from("publicacoes")
    .select(SELECT)
    .eq("status", "aprovada")
    .order("publicado_em", { ascending: false });
  if (error) throw error;
  return data as unknown as PublicacaoComEmpresa[];
}

export async function pubById(id: string): Promise<PublicacaoComEmpresa | null> {
  if (!supabaseEnabled || !supabase) return MOCK.find((p) => p.id === id) ?? null;
  const { data, error } = await supabase.from("publicacoes").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as PublicacaoComEmpresa) ?? null;
}

// Tempo de leitura estimado (~200 palavras/min) a partir do corpo —
// substitui o campo "tempo" do protótipo, que não existe no schema.
export function tempoLeitura(corpo: string[]): string {
  const palavras = corpo.join(" ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(palavras / 200))} min`;
}
