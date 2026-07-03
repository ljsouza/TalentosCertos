import { supabase, supabaseEnabled } from "@/lib/supabase";
import type { EmpresaPerfil, VagaComEmpresa } from "@/data/types";

// Camada de leitura pública do perfil institucional da empresa.
// Mesmo padrão de src/data/vagas.ts: cai no mock enquanto o Supabase não
// está configurado; quando estiver, troca-se só o corpo.

// Todas as colunas institucionais de `empresas` (espelha EmpresaPerfil).
const SELECT =
  "id,nome,setor,verificada,responde,tempo_resposta,logo_url,sobre,sobre_longo,fundada,funcionarios,site,endereco,destaques,video_youtube";

const VAGA_SELECT = "*, empresa:empresas(id,nome,setor,verificada,responde,tempo_resposta,logo_url)";

const MOCK_EMPRESA: EmpresaPerfil = {
  id: "e2",
  nome: "Apitec Engenharia",
  setor: "Indústria / Engenharia",
  verificada: true,
  responde: true,
  tempo_resposta: "4 dias",
  logo_url: null,
  sobre: "Engenharia industrial e automação para o agronegócio do Paraná.",
  sobre_longo:
    "Há mais de uma década, a Apitec projeta e mantém soluções de automação para indústrias e cooperativas da região de Maringá. Times multidisciplinares de engenharia, dados e campo.",
  fundada: 2012,
  funcionarios: "51–200",
  site: "https://exemplo.com.br",
  endereco: "Maringá, PR",
  destaques: ["Plano de carreira estruturado", "Squad de dados próprio", "Cultura de segurança"],
  video_youtube: null,
};

export async function empresaById(id: string): Promise<EmpresaPerfil | null> {
  if (!supabaseEnabled || !supabase) return MOCK_EMPRESA.id === id ? MOCK_EMPRESA : null;
  const { data, error } = await supabase.from("empresas").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as unknown as EmpresaPerfil) ?? null;
}

// Vagas abertas de uma empresa — alimenta a lista no perfil público.
export async function vagasDaEmpresa(empresaId: string): Promise<VagaComEmpresa[]> {
  if (!supabaseEnabled || !supabase) return [];
  const { data, error } = await supabase
    .from("vagas")
    .select(VAGA_SELECT)
    .eq("empresa_id", empresaId)
    .eq("status", "aberta")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data as unknown as VagaComEmpresa[];
}
