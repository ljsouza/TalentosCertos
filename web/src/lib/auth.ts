import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Exige sessão de empresa. Redireciona se deslogado ou papel errado.
// Retorna o cliente já autenticado para reuso na própria request.
export async function requireEmpresa() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfis").select("papel,nome").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "empresa") redirect("/");
  const { data: empresa } = await supabase.from("empresas").select("*").eq("dono_id", user.id).maybeSingle();
  return { user, perfil, empresa, supabase };
}

// Exige sessão de admin.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfis").select("papel,nome").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "admin") redirect("/");
  return { user, perfil, supabase };
}

// Exige sessão de candidato.
export async function requireCandidato() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const { data: perfil } = await supabase.from("perfis").select("papel,nome").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "candidato") redirect("/");
  return { user, perfil, supabase };
}
