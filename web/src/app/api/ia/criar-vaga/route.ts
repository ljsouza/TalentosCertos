import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarVaga } from "@/lib/ia";

// POST /empregos/api/ia/criar-vaga  { brief: string }
// Protegido: só empresa logada. A key do Gemini fica no servidor.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "empresa") return NextResponse.json({ erro: "Apenas empresas." }, { status: 403 });

  let brief = "";
  try {
    brief = String((await request.json())?.brief || "").trim();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }
  if (brief.length < 8) return NextResponse.json({ erro: "Descreva a vaga em uma frase." }, { status: 400 });

  try {
    const vaga = await gerarVaga(brief);
    return NextResponse.json(vaga);
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Falha ao gerar." }, { status: 502 });
  }
}
