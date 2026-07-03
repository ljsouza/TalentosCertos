"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";

// Botão admin: gera embeddings das vagas sem vetor (match semântico).
export function BackfillButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/empregos/api/admin/backfill-embeddings", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.erro || "Falha.");
      setMsg(`${d.processadas} vaga(s) indexada(s)${d.falhas ? `, ${d.falhas} falha(s)` : ""}.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Falha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16, margin: "8px 0 24px" }}>
      <strong style={{ fontSize: 14 }}><Icon name="bolt" size={15} /> Match semântico</strong>
      <p style={{ color: "var(--ink-60)", fontSize: 13, margin: "4px 0 10px" }}>Gera os embeddings das vagas abertas sem vetor (necessário para recomendações).</p>
      <button className="btn btn-dark btn-sm" onClick={run} disabled={loading}>{loading ? "Gerando…" : "Gerar embeddings das vagas"}</button>
      {msg && <p style={{ marginTop: 8, fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{msg}</p>}
    </div>
  );
}
