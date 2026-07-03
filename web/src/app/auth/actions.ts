"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Estado = { erro?: string } | undefined;

export async function signIn(_prev: Estado, formData: FormData): Promise<Estado> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { erro: traduz(error.message) };
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(_prev: Estado, formData: FormData): Promise<Estado> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const nome = String(formData.get("nome") || "");
  const papel = String(formData.get("papel") || "candidato");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, papel } },
  });
  if (error) return { erro: traduz(error.message) };
  revalidatePath("/", "layout");
  redirect(papel === "empresa" ? "/painel-empresa" : "/painel-candidato");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

function traduz(msg: string): string {
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/already registered/i.test(msg)) return "Este e-mail já tem conta. Faça login.";
  if (/at least 6/i.test(msg)) return "A senha precisa de pelo menos 6 caracteres.";
  if (/Email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar.";
  return msg;
}
