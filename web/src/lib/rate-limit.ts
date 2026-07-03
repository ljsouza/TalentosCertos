// Rate-limit best-effort em memória (janela deslizante por chave).
// ATENÇÃO: é por instância — em serverless não é global. Serve como freio
// básico contra abuso rápido do mesmo usuário numa instância quente. Para
// produção, trocar por um store distribuído (ex.: Upstash Redis / Vercel KV).

const hits = new Map<string, number[]>();

export function rateLimit(key: string, limite: number, janelaMs: number): boolean {
  const agora = Date.now();
  const inicio = agora - janelaMs;
  const registros = (hits.get(key) ?? []).filter((t) => t > inicio);
  if (registros.length >= limite) {
    hits.set(key, registros);
    return false; // estourou o limite
  }
  registros.push(agora);
  hits.set(key, registros);
  return true;
}
