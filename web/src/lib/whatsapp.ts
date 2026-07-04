// WhatsApp — Meta Cloud API (server only). Env-gated com mock (padrão do email/ia).
// Requer WHATSAPP_TOKEN + WHATSAPP_PHONE_ID (fornecidos pela Prefeitura, RNF-12).
// Produção: mensagens iniciadas pela plataforma exigem TEMPLATE aprovado no Meta;
// texto livre só funciona dentro da janela de 24h de atendimento. Aqui enviamos
// texto (suficiente para dev/mock e janela ativa); trocar por template na integração real.

const API = "https://graph.facebook.com/v21.0";

// Normaliza para E.164 do Brasil (55 + DDD + número), a partir de texto livre.
export function normalizarTelefone(telefone: string | null | undefined): string | null {
  const digits = (telefone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return "55" + digits;
  return digits;
}

export async function enviarWhatsApp({ to, texto }: { to: string | null; texto: string }): Promise<boolean> {
  const numero = normalizarTelefone(to);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!numero) {
    console.log("[whatsapp] sem telefone válido — pulando");
    return false;
  }
  if (!token || !phoneId) {
    console.log(`[whatsapp] sem credenciais — pulando msg para ${numero}`);
    return false;
  }
  try {
    const res = await fetch(`${API}/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: numero, type: "text", text: { body: texto } }),
    });
    if (!res.ok) {
      console.error(`[whatsapp] falha ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[whatsapp] erro de rede:", e);
    return false;
  }
}
