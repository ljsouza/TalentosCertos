import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extrairCurriculo } from "@/lib/ia";

// POST /empregos/api/ia/extrair-curriculo  { texto?: string, pdfBase64?: string }
// Protegido: só candidato logado. A key do Gemini fica no servidor.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "candidato") return NextResponse.json({ erro: "Apenas candidatos." }, { status: 403 });

  let body: { texto?: string; pdfBase64?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }
  const texto = String(body.texto || "").trim();
  if (!body.pdfBase64 && texto.length < 30) {
    return NextResponse.json({ erro: "Cole o texto do currículo ou envie um PDF." }, { status: 400 });
  }

  try {
    const perfilExtraido = await extrairCurriculo({ texto, pdfBase64: body.pdfBase64 });
    return NextResponse.json(perfilExtraido);
  } catch (e) {
    return NextResponse.json({ erro: e instanceof Error ? e.message : "Falha ao extrair." }, { status: 502 });
  }
}
