import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /empregos/api/meus-dados — Portal de Direitos do Titular (RNF-09):
// baixa todos os dados pessoais do usuário logado em JSON. RLS garante que só
// os dados do próprio usuário são retornados.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const [perfil, candidato, candidaturas, salvas, consentimentos, empresa] = await Promise.all([
    supabase.from("perfis").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("candidatos").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("candidaturas").select("*").eq("candidato_id", user.id),
    supabase.from("vagas_salvas").select("*").eq("candidato_id", user.id),
    supabase.from("consentimentos").select("*").eq("user_id", user.id).order("criado_em", { ascending: false }),
    supabase.from("empresas").select("*").eq("dono_id", user.id),
  ]);

  const dump = {
    exportado_em: new Date().toISOString(),
    usuario: { id: user.id, email: user.email },
    perfil: perfil.data ?? null,
    candidato: candidato.data ?? null,
    candidaturas: candidaturas.data ?? [],
    vagas_salvas: salvas.data ?? [],
    consentimentos: consentimentos.data ?? [],
    empresas: empresa.data ?? [],
  };

  return new NextResponse(JSON.stringify(dump, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados.json"',
    },
  });
}
