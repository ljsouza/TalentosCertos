"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentOrgId, getBrand } from "@/lib/tenant";
import { emailMarca } from "@/lib/notify";
import { POLICY_VERSION } from "@/lib/consentimento";

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
  const cons = {
    candidaturas: formData.get("c_candidaturas") != null,
    whatsapp: formData.get("c_whatsapp") != null,
    compartilhamento: formData.get("c_compartilhamento") != null,
  };
  const supabase = await createClient();
  // Vincula a nova conta ao tenant corrente (resolvido do subdomínio/host).
  // O trigger handle_new_user usa este org_id; sem ele, cai no MaringáPost.
  const orgId = await currentOrgId();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, papel, ...(orgId ? { org_id: orgId } : {}) } },
  });
  if (error) return { erro: traduz(error.message) };

  // Registro dos consentimentos granulares (RNF-07) com versão + IP, via
  // service-role (a conta pode ainda não ter sessão por causa da confirmação).
  const userId = data.user?.id;
  const admin = createAdminClient();
  if (userId && admin) {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || null;
    await admin.from("consentimentos").insert(
      (["candidaturas", "whatsapp", "compartilhamento"] as const).map((tipo) => ({
        user_id: userId, org_id: orgId, tipo, aceito: cons[tipo], versao: POLICY_VERSION, ip,
      }))
    );
  }

  revalidatePath("/", "layout");
  redirect(papel === "empresa" ? "/painel-empresa" : "/painel-candidato");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// LGPD — direito ao esquecimento: apaga todos os dados do usuário (via função
// SQL excluir_minha_conta, escopada a auth.uid()) e encerra a sessão.
export async function excluirConta(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const emailUsuario = user.email;
  const { error } = await supabase.rpc("excluir_minha_conta");
  if (error) throw new Error(error.message);

  // Confirmação de exclusão (item 1.16). Enviada antes do redirect.
  if (emailUsuario) {
    const brand = await getBrand();
    await emailMarca(
      emailUsuario,
      `Conta excluída — ${brand.nome}`,
      "Sua conta foi excluída",
      `<p>Confirmamos a exclusão da sua conta e a remoção dos seus dados pessoais, conforme a LGPD.</p>
       <p>Se não foi você, entre em contato conosco.</p>`,
      brand
    );
  }

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
