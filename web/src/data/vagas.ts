import { supabase, supabaseEnabled } from "@/lib/supabase";
import { currentOrgId } from "@/lib/tenant";
import type { VagaComEmpresa } from "@/data/types";

// ── PADRÃO-CHAVE DA ARQUITETURA ────────────────────────────────────────────
// Esta camada expõe as mesmas funções que o protótipo lia de `window`
// (getVagas, vagaById). Enquanto o Supabase não está configurado, retorna o
// mock; quando estiver, troca-se só o corpo — as telas NÃO mudam.
// As vagas vêm com a empresa embutida (join) para alimentar os cards.
// ───────────────────────────────────────────────────────────────────────────

const SELECT = "*, empresa:empresas(id,nome,setor,verificada,responde,tempo_resposta,logo_url)";

const MOCK_VAGAS: VagaComEmpresa[] = [
  {
    id: "v1",
    empresa_id: "e2",
    titulo: "Analista de Dados Júnior",
    area: "Tecnologia / TI",
    cidade: "Maringá",
    modalidade: "remoto",
    tipos: ["clt", "home"],
    salario_min: 3500,
    salario_max: 4800,
    experiencia: "Com experiência",
    descricao:
      "Você vai estruturar dashboards, manter pipelines de dados e apoiar decisões de negócio com análises claras.",
    requisitos: ["Excel avançado e SQL", "Power BI ou Looker", "Lógica e curiosidade analítica", "Desejável Python"],
    beneficios: ["Vale-refeição", "Plano de saúde", "Home office híbrido", "Day off de aniversário"],
    filtro_pergunta: "Em 30 segundos: qual análise de dados que você fez gerou mais impacto — e por quê?",
    filtro_formato: "audio",
    destaque: true,
    status: "aberta",
    prazo: "2026-06-17",
    criado_em: new Date().toISOString(),
    empresa: {
      id: "e2",
      nome: "Apitec Engenharia",
      setor: "Indústria / Engenharia",
      verificada: true,
      responde: true,
      tempo_resposta: "4 dias",
      logo_url: null,
    },
  },
];

export async function getVagas(): Promise<VagaComEmpresa[]> {
  if (!supabaseEnabled || !supabase) return MOCK_VAGAS;
  const orgId = await currentOrgId();
  let query = supabase.from("vagas").select(SELECT).eq("status", "aberta");
  if (orgId) query = query.eq("org_id", orgId);
  const { data, error } = await query.order("criado_em", { ascending: false });
  if (error) throw error;
  return data as unknown as VagaComEmpresa[];
}

export async function vagaById(id: string): Promise<VagaComEmpresa | null> {
  if (!supabaseEnabled || !supabase) return MOCK_VAGAS.find((v) => v.id === id) ?? null;
  const orgId = await currentOrgId();
  let query = supabase.from("vagas").select(SELECT).eq("id", id);
  if (orgId) query = query.eq("org_id", orgId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data as unknown as VagaComEmpresa) ?? null;
}
