import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contatoDe, emailMarca } from "@/lib/notify";
import type { Brand } from "@/lib/tenant";

// Cron diário (item 1.10): encerra vagas vencidas E notifica a empresa por e-mail.
// Substitui a parte de e-mail do pg_cron (0006) — agende via Vercel Cron chamando
// este endpoint 1x/dia (recomenda-se desativar o job pg_cron para evitar que ele
// encerre antes, deixando este sem o que notificar).
// Protegido por CRON_SECRET (header Authorization: Bearer <segredo>).

type VagaVencida = {
  id: string;
  titulo: string;
  empresa: { dono_id: string | null; nome: string | null } | null;
  org: { nome: string | null; branding: Record<string, string> | null } | null;
};

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  if (!secret) console.warn("[cron] CRON_SECRET não configurado — endpoint aberto (configure em produção).");

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY não configurada." }, { status: 500 });
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("vagas")
    .select("id, titulo, empresa:empresas(dono_id,nome), org:organizacoes(nome,branding)")
    .eq("status", "aberta")
    .not("prazo", "is", null)
    .lt("prazo", hoje);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const vagas = (data as unknown as VagaVencida[]) || [];
  if (vagas.length === 0) return NextResponse.json({ encerradas: 0 });

  // Encerra todas em lote.
  await admin.from("vagas").update({ status: "encerrada" }).in("id", vagas.map((v) => v.id));

  // Notifica cada empresa (não bloqueia se um e-mail falhar).
  for (const v of vagas) {
    if (!v.empresa?.dono_id) continue;
    const { email, nome } = await contatoDe(v.empresa.dono_id);
    if (!email) continue;
    const brand: Brand = {
      nome: v.org?.nome ?? "Empregos",
      regiao: "",
      heroTitle: "",
      heroSub: "",
      accent: v.org?.branding?.accent ?? null,
      logoWord: v.org?.nome ?? "Empregos",
      logoTag: "",
      footerSobre: "",
    };
    await emailMarca(
      email,
      `Vaga encerrada — ${v.titulo}`,
      "Sua vaga foi encerrada",
      `<p>Olá${nome ? `, ${nome}` : ""}. A vaga <strong>${v.titulo}</strong> atingiu o prazo e foi encerrada automaticamente.</p>
       <p>Ela saiu da listagem pública. Você pode reabri-la ou publicar uma nova pelo painel.</p>`,
      brand
    );
  }

  return NextResponse.json({ encerradas: vagas.length });
}
