"use server";
import { revalidatePath } from "next/cache";
import { requireCandidato } from "@/lib/auth";
import { gerarEmbedding, textoCandidato } from "@/lib/embeddings";
import { validarCPF, soDigitos } from "@/lib/validacao";
import { currentOrgId } from "@/lib/tenant";
import { POLICY_VERSION } from "@/lib/consentimento";

type Estado = { ok?: boolean; erro?: string } | undefined;

const linhas = (s: string) => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
const parseJson = <T,>(s: string, fallback: T): T => {
  try { return JSON.parse(s) as T; } catch { return fallback; }
};

export async function salvarPerfil(_prev: Estado, formData: FormData): Promise<Estado> {
  const { user, supabase } = await requireCandidato();
  const nome = String(formData.get("nome") || "").trim();
  const area = String(formData.get("area") || "") || null;
  const resumo = String(formData.get("resumo") || "") || null;
  const skills = linhas(String(formData.get("skills") || ""));
  const curriculoUrl = String(formData.get("curriculo_url") || "") || null;

  // CPF (opcional, mas se informado precisa ser válido).
  const cpfRaw = String(formData.get("cpf") || "").trim();
  if (cpfRaw && !validarCPF(cpfRaw)) return { erro: "CPF inválido." };
  const cpf = cpfRaw ? soDigitos(cpfRaw) : null;

  const formacoes = parseJson(String(formData.get("formacoes") || "[]"), [] as unknown[]);
  const experiencias = parseJson(String(formData.get("experiencias") || "[]"), [] as unknown[]);
  const pontosFortes = parseJson(String(formData.get("pontos_fortes") || "[]"), [] as string[]);

  if (nome) {
    await supabase.from("perfis").update({ nome }).eq("id", user.id);
  }

  // Embedding do perfil para o match semântico (não bloqueia se falhar).
  const emb = await gerarEmbedding(textoCandidato({ area, resumo, skills }));

  const { error } = await supabase.from("candidatos").update({
    area,
    cidade: String(formData.get("cidade") || "") || null,
    resumo,
    skills,
    ...(cpf ? { cpf } : {}),
    formacoes,
    experiencias,
    pontos_fortes: pontosFortes,
    ...(curriculoUrl ? { curriculo_url: curriculoUrl } : {}),
    ...(emb ? { embedding: emb } : {}),
  }).eq("id", user.id);

  if (error) return { erro: error.message };
  revalidatePath("/painel-candidato");
  revalidatePath("/", "layout");
  return { ok: true };
}

// Radar de Vagas por WhatsApp (item 1.14) — opt-in com consentimento LGPD.
export async function salvarRadar(_prev: Estado, formData: FormData): Promise<Estado> {
  const { user, supabase } = await requireCandidato();
  const ativar = formData.get("radar_ativo") != null;
  const consentiu = formData.get("consentimento") != null;
  const telefone = String(formData.get("telefone") || "").trim();
  const salRaw = soDigitos(String(formData.get("radar_salario_min") || ""));
  const radarSalarioMin = salRaw ? Number(salRaw) : null;

  if (ativar && !consentiu) return { erro: "Para ativar o Radar, aceite o consentimento (LGPD)." };
  if (ativar && !telefone) return { erro: "Informe seu WhatsApp para ativar o Radar." };

  if (telefone) await supabase.from("perfis").update({ telefone }).eq("id", user.id);
  const { error } = await supabase.from("candidatos").update({
    radar_whatsapp: ativar,
    radar_consentido_em: ativar ? new Date().toISOString() : null,
    radar_salario_min: radarSalarioMin,
  }).eq("id", user.id);
  if (error) return { erro: error.message };
  // Registra o consentimento de WhatsApp no histórico (RNF-07).
  await supabase.from("consentimentos").insert({ user_id: user.id, org_id: await currentOrgId(), tipo: "whatsapp", aceito: ativar, versao: POLICY_VERSION });
  revalidatePath("/painel-candidato");
  return { ok: true };
}

// Revoga um consentimento (RNF-09) — registra uma linha aceito=false no histórico.
export async function revogarConsentimento(formData: FormData): Promise<void> {
  const { user, supabase } = await requireCandidato();
  const tipo = String(formData.get("tipo") || "");
  if (!["candidaturas", "whatsapp", "compartilhamento"].includes(tipo)) return;
  await supabase.from("consentimentos").insert({ user_id: user.id, org_id: await currentOrgId(), tipo, aceito: false, versao: POLICY_VERSION });
  // Revogar o WhatsApp também desativa o Radar.
  if (tipo === "whatsapp") await supabase.from("candidatos").update({ radar_whatsapp: false }).eq("id", user.id);
  revalidatePath("/painel-candidato");
}
