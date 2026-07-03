import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarEmbedding, textoVaga } from "@/lib/embeddings";

// POST /empregos/api/admin/backfill-embeddings — admin gera embeddings das
// vagas abertas que ainda não têm (inclui as do seed). Idempotente.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  if (perfil?.papel !== "admin") return NextResponse.json({ erro: "Apenas admin." }, { status: 403 });

  const { data: vagas } = await supabase
    .from("vagas")
    .select("id,titulo,area,descricao,requisitos")
    .eq("status", "aberta")
    .is("embedding", null);

  let ok = 0;
  let falhou = 0;
  for (const v of (vagas as { id: string; titulo: string; area: string | null; descricao: string | null; requisitos: string[] }[]) || []) {
    const emb = await gerarEmbedding(textoVaga(v));
    if (!emb) { falhou++; continue; }
    const { error } = await supabase.rpc("set_vaga_embedding", { p_vaga_id: v.id, p_emb: emb });
    if (error) falhou++; else ok++;
  }

  return NextResponse.json({ processadas: ok, falhas: falhou, total: (vagas?.length || 0) });
}
