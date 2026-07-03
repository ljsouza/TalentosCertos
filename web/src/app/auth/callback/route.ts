import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recebe o redirect do OAuth (Google/Facebook) ou da confirmação de e-mail,
// troca o ?code= por uma sessão e manda o usuário para o destino (next).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/empregos${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/empregos/entrar?erro=auth`);
}
