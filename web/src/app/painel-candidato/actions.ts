"use server";
import { revalidatePath } from "next/cache";
import { requireCandidato } from "@/lib/auth";
import { gerarEmbedding, textoCandidato } from "@/lib/embeddings";
import { validarCPF, soDigitos } from "@/lib/validacao";

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
