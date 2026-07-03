"use server";
import { revalidatePath } from "next/cache";
import { requireCandidato } from "@/lib/auth";
import { gerarEmbedding, textoCandidato } from "@/lib/embeddings";

type Estado = { ok?: boolean; erro?: string } | undefined;

const linhas = (s: string) => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);

export async function salvarPerfil(_prev: Estado, formData: FormData): Promise<Estado> {
  const { user, supabase } = await requireCandidato();
  const nome = String(formData.get("nome") || "").trim();
  const area = String(formData.get("area") || "") || null;
  const resumo = String(formData.get("resumo") || "") || null;
  const skills = linhas(String(formData.get("skills") || ""));

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
    ...(emb ? { embedding: emb } : {}),
  }).eq("id", user.id);

  if (error) return { erro: error.message };
  revalidatePath("/painel-candidato");
  revalidatePath("/", "layout");
  return { ok: true };
}
