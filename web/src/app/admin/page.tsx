import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  aprovarPub,
  reprovarPub,
  definirVerificacaoEmpresa,
  definirStatusEmpresa,
  definirPacoteEmpresa,
} from "@/app/admin/actions";
import { BackfillButton } from "@/components/BackfillButton";
import { Icon } from "@/components/Icon";
import type { PublicacaoComEmpresa, Empresa, Pacote } from "@/data/types";

export const metadata: Metadata = { title: "Moderação (admin)" };

const STATUS_CHIP: Record<string, string> = { pendente: "Pendente", aprovada: "Aprovada", reprovada: "Reprovada" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data }, { data: empData }, { data: pacData }] = await Promise.all([
    supabase
      .from("publicacoes")
      .select("*, empresa:empresas(id,nome)")
      .order("criado_em", { ascending: false }),
    supabase
      .from("empresas")
      .select("id,nome,setor,verificada,responde,tempo_resposta,logo_url,status,pacote_id")
      .order("nome", { ascending: true }),
    supabase.from("pacotes").select("id,nome,preco,periodo,vagas_limite,recursos,destaque").order("preco", { ascending: true, nullsFirst: false }),
  ]);
  const pubs = (data as unknown as PublicacaoComEmpresa[]) || [];
  const pendentes = pubs.filter((p) => p.status === "pendente");
  const resto = pubs.filter((p) => p.status !== "pendente");
  const empresas = (empData as unknown as Empresa[]) || [];
  const pacotes = (pacData as unknown as Pacote[]) || [];
  const empresasPendentes = empresas.filter((e) => e.status === "pendente");
  const pacoteNome = (id?: string | null) => pacotes.find((p) => p.id === id)?.nome ?? "Sem plano";

  return (
    <div className="screen" style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px" }}>
      <span className="chapeu">Moderação</span>
      <h1 style={{ fontSize: 28, margin: "6px 0 16px" }}>Publicações de Carreira &amp; RH</h1>

      <BackfillButton />

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Aguardando moderação ({pendentes.length})</h2>
      {pendentes.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nada pendente. 🎉</p>
      ) : (
        <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0, margin: "0 0 32px" }}>
          {pendentes.map((p) => (
            <li key={p.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
              <span className="chapeu">{p.chapeu} · {p.empresa?.nome || "Redação"}</span>
              <h3 style={{ fontSize: 17, margin: "4px 0 6px" }}>{p.titulo}</h3>
              <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 12 }}>{p.lead}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                <form action={aprovarPub}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="btn btn-primary btn-sm">Aprovar</button>
                </form>
                <form action={reprovarPub} style={{ display: "flex", gap: 6, flex: 1, minWidth: 240 }}>
                  <input type="hidden" name="id" value={p.id} />
                  <input name="motivo" placeholder="Motivo da reprovação (opcional)" style={{ flex: 1, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }} />
                  <button type="submit" className="btn btn-ghost btn-sm">Reprovar</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Histórico ({resto.length})</h2>
      <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
        {resto.map((p) => (
          <li key={p.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{p.titulo}</strong>
              {p.status === "reprovada" && p.motivo && <div style={{ color: "var(--ink-60)", fontSize: 12.5 }}>Motivo: {p.motivo}</div>}
            </div>
            <span className="chip">{STATUS_CHIP[p.status]}</span>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: 18, margin: "32px 0 12px" }}>Empresas aguardando aprovação ({empresasPendentes.length})</h2>
      {empresasPendentes.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhuma empresa pendente. 🎉</p>
      ) : (
        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: "0 0 32px" }}>
          {empresasPendentes.map((e) => (
            <li key={e.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 14 }}>{e.nome}</strong>
                {e.setor && <div style={{ color: "var(--ink-60)", fontSize: 12.5 }}>{e.setor}</div>}
              </div>
              <form action={definirStatusEmpresa}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="status" value="ativa" />
                <button type="submit" className="btn btn-primary btn-sm">Aprovar</button>
              </form>
              <form action={definirStatusEmpresa}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="status" value="bloqueada" />
                <button type="submit" className="btn btn-ghost btn-sm">Bloquear</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: 18, margin: "32px 0 12px" }}>
        Empresas ({empresas.length}) · {empresas.filter((e) => e.verificada).length} verificadas
      </h2>
      <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
        {empresas.map((e) => (
          <li key={e.id} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Link href={`/empresa-perfil/${e.id}`} style={{ fontWeight: 600, fontSize: 14 }}>{e.nome}</Link>
              <div style={{ color: "var(--ink-60)", fontSize: 12.5 }}>
                <span className="chip">{e.status ?? "ativa"}</span> · {pacoteNome(e.pacote_id)}
                {e.verificada && <span className="verif" style={{ marginLeft: 6 }}><Icon name="shield" size={12} /> Verificada</span>}
              </div>
            </div>

            {/* Cobrança manual: vincular/trocar o plano */}
            <form action={definirPacoteEmpresa} style={{ display: "flex", gap: 6 }}>
              <input type="hidden" name="id" value={e.id} />
              <select name="pacote_id" defaultValue={e.pacote_id ?? ""} style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5 }}>
                <option value="">Sem plano</option>
                {pacotes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-ghost btn-sm">Salvar</button>
            </form>

            {/* Verificação */}
            <form action={definirVerificacaoEmpresa}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="verificada" value={e.verificada ? "false" : "true"} />
              <button type="submit" className={`btn btn-sm ${e.verificada ? "btn-ghost" : "btn-primary"}`}>
                {e.verificada ? "Revogar selo" : "Verificar"}
              </button>
            </form>

            {/* Bloqueio / reativação */}
            <form action={definirStatusEmpresa}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="status" value={e.status === "bloqueada" ? "ativa" : "bloqueada"} />
              <button type="submit" className="btn btn-ghost btn-sm">
                {e.status === "bloqueada" ? "Reativar" : "Bloquear"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
