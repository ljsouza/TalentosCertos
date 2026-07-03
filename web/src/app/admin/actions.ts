"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function aprovarPub(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  await supabase
    .from("publicacoes")
    .update({ status: "aprovada", motivo: null, publicado_em: new Date().toISOString().slice(0, 10) })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/conteudo");
}

export async function reprovarPub(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const motivo = String(formData.get("motivo") || "").trim() || "Conteúdo não aprovado pela moderação.";
  await supabase.from("publicacoes").update({ status: "reprovada", motivo }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/conteudo");
}

// Concede/revoga o selo de empresa verificada. Exclusivo do admin (o trigger
// empresas_no_self_verificacao bloqueia qualquer outra origem).
export async function definirVerificacaoEmpresa(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const verificada = String(formData.get("verificada") || "") === "true";
  await supabase.from("empresas").update({ verificada }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/empresa-perfil/${id}`);
  revalidatePath("/");
}
