"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEmpresa } from "@/lib/auth";
import { gerarEmbedding, textoVaga } from "@/lib/embeddings";

type Estado = { erro?: string; ok?: boolean } | undefined;

// Quebra um textarea em itens (1 por linha), limpando vazios.
const linhas = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export async function createVaga(_prev: Estado, formData: FormData): Promise<Estado> {
  const { empresa, supabase } = await requireEmpresa();
  if (!empresa) return { erro: "Empresa não encontrada para esta conta." };

  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return { erro: "Informe o título da vaga." };

  const salMin = formData.get("salario_min");
  const salMax = formData.get("salario_max");
  const filtroPergunta = String(formData.get("filtro_pergunta") || "").trim();

  const area = String(formData.get("area") || "") || null;
  const descricao = String(formData.get("descricao") || "") || null;
  const requisitos = linhas(String(formData.get("requisitos") || ""));

  const { data: nova, error } = await supabase.from("vagas").insert({
    empresa_id: empresa.id,
    titulo,
    area,
    cidade: String(formData.get("cidade") || "") || null,
    modalidade: String(formData.get("modalidade") || "") || null,
    tipos: formData.getAll("tipos").map(String),
    salario_min: salMin ? Number(salMin) : null,
    salario_max: salMax ? Number(salMax) : null,
    experiencia: String(formData.get("experiencia") || "") || null,
    descricao,
    requisitos,
    beneficios: linhas(String(formData.get("beneficios") || "")),
    filtro_pergunta: filtroPergunta || null,
    filtro_formato: filtroPergunta ? "audio" : null,
    prazo: String(formData.get("prazo") || "") || null,
    status: "aberta",
  }).select("id").single();

  if (error) return { erro: error.message };

  // Embedding para o match semântico (não bloqueia se falhar).
  const emb = await gerarEmbedding(textoVaga({ titulo, area, descricao, requisitos }));
  if (emb && nova) await supabase.from("vagas").update({ embedding: emb }).eq("id", nova.id);

  revalidatePath("/painel-empresa");
  revalidatePath("/"); // a vaga já aparece na home
  redirect("/painel-empresa");
}

export async function atualizarPerfilEmpresa(_prev: Estado, formData: FormData): Promise<Estado> {
  const { empresa, supabase } = await requireEmpresa();
  if (!empresa) return { erro: "Empresa não encontrada para esta conta." };

  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return { erro: "Informe o nome da empresa." };

  const fundadaRaw = String(formData.get("fundada") || "").trim();
  const fundada = fundadaRaw ? Number(fundadaRaw) : null;
  if (fundada !== null && (!Number.isInteger(fundada) || fundada < 1800 || fundada > new Date().getFullYear())) {
    return { erro: "Ano de fundação inválido." };
  }

  // O dono edita só os campos institucionais — `verificada` é exclusiva do admin.
  const { error } = await supabase
    .from("empresas")
    .update({
      nome,
      setor: String(formData.get("setor") || "") || null,
      sobre: String(formData.get("sobre") || "") || null,
      sobre_longo: String(formData.get("sobre_longo") || "") || null,
      fundada,
      funcionarios: String(formData.get("funcionarios") || "") || null,
      site: String(formData.get("site") || "") || null,
      endereco: String(formData.get("endereco") || "") || null,
      destaques: linhas(String(formData.get("destaques") || "")),
      video_youtube: String(formData.get("video_youtube") || "") || null,
      logo_url: String(formData.get("logo_url") || "") || null,
    })
    .eq("id", empresa.id);

  if (error) return { erro: error.message };

  revalidatePath("/painel-empresa");
  revalidatePath(`/empresa-perfil/${empresa.id}`);
  return { ok: true };
}

export async function encerrarVaga(formData: FormData): Promise<void> {
  const { supabase } = await requireEmpresa();
  const id = String(formData.get("id") || "");
  await supabase.from("vagas").update({ status: "encerrada" }).eq("id", id);
  revalidatePath("/painel-empresa");
  revalidatePath("/");
}
