import { createAdminClient } from "@/lib/supabase/admin";
import { enviarEmail, layoutEmail } from "@/lib/email";
import type { Brand } from "@/lib/tenant";

// Notificações — SERVER ONLY. Busca contato de usuários (e-mail em auth.users,
// que a RLS do anon não expõe) via cliente service-role. Sem a service key,
// degrada para no-op (log), como o email/whatsapp.

export type Contato = { email: string | null; nome: string | null; telefone: string | null };

export async function contatoDe(userId: string): Promise<Contato> {
  const admin = createAdminClient();
  if (!admin) {
    console.log(`[notify] sem SUPABASE_SERVICE_ROLE_KEY — contato de ${userId} indisponível`);
    return { email: null, nome: null, telefone: null };
  }
  const [{ data: u }, { data: p }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("perfis").select("nome,telefone").eq("id", userId).maybeSingle(),
  ]);
  const perfil = p as { nome?: string; telefone?: string } | null;
  return {
    email: u?.user?.email ?? null,
    nome: perfil?.nome ?? null,
    telefone: perfil?.telefone ?? null,
  };
}

// E-mail transacional com a marca do tenant.
export async function emailMarca(
  to: string,
  subject: string,
  titulo: string,
  corpoHtml: string,
  brand: Brand
): Promise<void> {
  await enviarEmail({
    to,
    subject,
    html: layoutEmail(titulo, corpoHtml, { nome: brand.nome, accent: brand.accent ?? undefined }),
  });
}
