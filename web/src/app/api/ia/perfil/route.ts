import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarPerfilIA } from "@/lib/ia";
import { rateLimit } from "@/lib/rate-limit";

// POST /empregos/api/ia/perfil  { area, resumo, skills, formacoes, experiencias }
// Perfil de IA do candidato (RF-38). Protegido: só candidato logado.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "candidato") return NextResponse.json({ erro: "Apenas candidatos." }, { status: 403 });
  if (!rateLimit(`ia:perfil:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ erro: "Muitas solicitações. Tente novamente em instantes." }, { status: 429 });
  }

  let body: { area?: string; resumo?: string; skills?: string[]; formacoes?: unknown[]; experiencias?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  try {
    return NextResponse.json(await gerarPerfilIA(body));
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Falha ao gerar." }, { status: 502 });
  }
}
