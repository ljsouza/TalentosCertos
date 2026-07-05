import { createAdminClient } from "@/lib/supabase/admin";
import { enviarWhatsApp } from "@/lib/whatsapp";

// Radar de Vagas (item 1.14) — SERVER ONLY. Ao publicar uma vaga, alerta por
// WhatsApp os candidatos do MESMO tenant que ativaram o radar e são compatíveis
// (mesma área; cidade e pretensão salarial quando informadas). Usa o cliente
// service-role (a empresa não pode ler candidatos de outros via RLS).
// Envio imediato atende o requisito de alerta em ≤5 min. Sem service key ou
// sem credenciais de WhatsApp, degrada para no-op.

type VagaRadar = {
  id: string;
  titulo: string;
  area: string | null;
  cidade: string | null;
  org_id: string | null | undefined;
  salario_max: number | null;
};

export async function notificarRadar(vaga: VagaRadar): Promise<number> {
  const admin = createAdminClient();
  if (!admin || !vaga.area || !vaga.org_id) return 0;

  const { data: cands } = await admin
    .from("candidatos")
    .select("id,cidade,radar_salario_min")
    .eq("org_id", vaga.org_id)
    .eq("radar_whatsapp", true)
    .eq("area", vaga.area);

  const alvos = (cands ?? []).filter((c) => {
    const cid = c as { cidade: string | null; radar_salario_min: number | null };
    if (vaga.cidade && cid.cidade && cid.cidade !== vaga.cidade) return false;
    if (cid.radar_salario_min && vaga.salario_max && vaga.salario_max < cid.radar_salario_min) return false;
    return true;
  });
  if (!alvos.length) return 0;

  const { data: perfis } = await admin
    .from("perfis")
    .select("id,nome,telefone")
    .in("id", alvos.map((c) => (c as { id: string }).id));
  const byId = new Map((perfis ?? []).map((p) => [(p as { id: string }).id, p as { nome: string | null; telefone: string | null }]));

  let enviados = 0;
  for (const c of alvos) {
    const p = byId.get((c as { id: string }).id);
    if (!p?.telefone) continue;
    const primeiro = (p.nome || "").split(" ")[0] || "";
    const ok = await enviarWhatsApp({
      to: p.telefone,
      texto:
        `Olá${primeiro ? ` ${primeiro}` : ""}! 🔔 Nova vaga compatível com seu Radar: ` +
        `"${vaga.titulo}"${vaga.cidade ? ` em ${vaga.cidade}` : ""}. ` +
        `Acesse o portal de empregos para ver os detalhes e se candidatar. ` +
        `(Para parar de receber, desative o Radar no seu painel.)`,
    });
    if (ok) enviados++;
  }
  return enviados;
}
