import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { TribunaPost } from "@/data/types";

const MOCK: TribunaPost[] = [
  {
    id: "tr1", autor_nome: "Marina Lopes", cargo: "Product Designer", area: "Design", tipo: "Portfólio",
    titulo: "Redesenhei o app de uma cooperativa de Maringá — e a adesão digital subiu 3x",
    lead: "Um estudo de caso completo.", corpo: ["Texto de exemplo."],
    leituras: 18400, curtidas: 1240, comentarios: 86, viral: true, radar: true, disponivel: true, publicado_em: "2026-06-12",
  },
];

export async function getTribuna(): Promise<TribunaPost[]> {
  if (!supabaseEnabled || !supabase) return MOCK;
  const { data, error } = await supabase.from("tribuna").select("*").order("leituras", { ascending: false });
  if (error) throw error;
  return data as TribunaPost[];
}

export async function tribunaById(id: string): Promise<TribunaPost | null> {
  if (!supabaseEnabled || !supabase) return MOCK.find((t) => t.id === id) ?? null;
  const { data, error } = await supabase.from("tribuna").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as TribunaPost) ?? null;
}
