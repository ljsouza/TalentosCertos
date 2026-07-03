// Embeddings via Gemini (gemini-embedding-001, 768 dims). Server-only.
// Usado para o match semântico (v2.0). Sem GEMINI_API_KEY → null (sem embedding).

const EMB_MODEL = "gemini-embedding-001";
export const EMB_DIM = 768;

export async function gerarEmbedding(texto: string): Promise<number[] | null> {
  const key = process.env.GEMINI_API_KEY;
  const t = texto.trim();
  if (!key || !t) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMB_MODEL}:embedContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text: t }] }, outputDimensionality: EMB_DIM }),
      }
    );
    if (!res.ok) {
      console.error(`[embeddings] ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const values = data?.embedding?.values;
    return Array.isArray(values) && values.length === EMB_DIM ? values : null;
  } catch (e) {
    console.error("[embeddings] erro:", e);
    return null;
  }
}

// Texto canônico para embedar uma vaga / um candidato.
export const textoVaga = (v: { titulo: string; area?: string | null; descricao?: string | null; requisitos?: string[] }) =>
  [v.titulo, v.area, v.descricao, (v.requisitos || []).join(", ")].filter(Boolean).join(". ");

export const textoCandidato = (c: { area?: string | null; resumo?: string | null; skills?: string[] }) =>
  [c.area, c.resumo, (c.skills || []).join(", ")].filter(Boolean).join(". ");
