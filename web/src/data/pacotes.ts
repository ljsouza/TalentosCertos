import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { Pacote } from "@/data/types";

const MOCK: Pacote[] = [
  { id: "p1", nome: "Atrair", preco: 149, periodo: "/mês", vagas_limite: 3, recursos: ["3 vagas publicadas por mês", "Painel básico de candidatos"], destaque: false },
  { id: "p2", nome: "Conectar", preco: 389, periodo: "/mês", vagas_limite: 12, recursos: ["12 vagas publicadas por mês", "Vagas em destaque"], destaque: true },
  { id: "p3", nome: "CrescerPro", preco: null, periodo: "sob consulta", vagas_limite: null, recursos: ["Vagas ilimitadas"], destaque: false },
];

export async function getPacotes(): Promise<Pacote[]> {
  if (!supabaseEnabled || !supabase) return MOCK;
  const { data, error } = await supabase.from("pacotes").select("*").order("preco", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as Pacote[];
}
