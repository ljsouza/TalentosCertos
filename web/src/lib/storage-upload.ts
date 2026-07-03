"use client";
import { createClient } from "@/lib/supabase/client";

// Uploads via cliente do navegador (com a sessão do usuário). A RLS de
// storage.objects (migration 00013) garante que só o dono escreve.

const MB = 1024 * 1024;

// Logo da empresa → bucket público 'logos', caminho logos/<empresa_id>/logo.<ext>.
// Retorna a URL pública para gravar em empresas.logo_url.
export async function uploadLogo(empresaId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Envie uma imagem (PNG, JPG, WEBP ou SVG).");
  if (file.size > 2 * MB) throw new Error("A logo deve ter até 2 MB.");
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${empresaId}/logo.${ext}`;
  const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("logos").getPublicUrl(path);
  // cache-buster para refletir a troca imediatamente
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Currículo do candidato → bucket privado 'curriculos', curriculos/<user_id>/curriculo.pdf.
// Retorna o path (bucket privado; visualização via signed URL no servidor).
export async function uploadCurriculo(file: File): Promise<string> {
  if (file.type !== "application/pdf") throw new Error("Envie o currículo em PDF.");
  if (file.size > 5 * MB) throw new Error("O PDF deve ter até 5 MB.");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Faça login para anexar o currículo.");
  const path = `${user.id}/curriculo.pdf`;
  const { error } = await supabase.storage.from("curriculos").upload(path, file, { upsert: true, contentType: "application/pdf" });
  if (error) throw new Error(error.message);
  return path;
}
