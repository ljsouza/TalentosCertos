// Envio de e-mail transacional via Resend (REST). Server-only.
// Sem RESEND_API_KEY → no-op (loga e segue), para não quebrar fluxos em dev.
// O remetente padrão (onboarding@resend.dev) só envia para o e-mail dono da
// conta Resend até você verificar um domínio próprio (RESEND_FROM).

const FROM = process.env.RESEND_FROM || "MaringáPost Empregos <onboarding@resend.dev>";

export async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email] sem RESEND_API_KEY — pulando "${subject}" para ${to}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!res.ok) console.error(`[email] falha ${res.status}: ${await res.text()}`);
  } catch (e) {
    // E-mail nunca deve derrubar a ação principal (candidatura etc.).
    console.error("[email] erro de rede:", e);
  }
}

// Layout simples e on-brand — a marca vem do tenant (default: MaringáPost).
export function layoutEmail(
  titulo: string,
  corpoHtml: string,
  brand?: { nome?: string; accent?: string }
): string {
  const nome = brand?.nome || "MaringáPost Empregos";
  const accent = brand?.accent || "#1f8a5b";
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#15171a">
    <div style="border-top:4px solid ${accent};padding:24px 0 8px">
      <strong style="font-size:18px">${nome}</strong>
    </div>
    <h1 style="font-size:20px;margin:16px 0 8px">${titulo}</h1>
    <div style="font-size:14px;line-height:1.6;color:#3a3d42">${corpoHtml}</div>
    <p style="font-size:12px;color:#9a9ea6;margin-top:32px;border-top:1px solid #e7e4dd;padding-top:12px">
      ${nome}
    </p>
  </div>`;
}
