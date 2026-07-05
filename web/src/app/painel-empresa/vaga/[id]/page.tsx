import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmpresa } from "@/lib/auth";
import { atualizarStatusCandidatura } from "@/app/painel-empresa/actions";
import { MatchRing } from "@/components/ui";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Candidatos da vaga" };

type Props = { params: Promise<{ id: string }> };

type Candidato = {
  candidatura_id: string;
  candidato_id: string;
  status: "enviada" | "triagem" | "selecionada" | "recusada";
  criado_em: string;
  nome: string | null;
  telefone: string | null;
  area: string | null;
  cidade: string | null;
  resumo: string | null;
  skills: string[] | null;
  tem_curriculo: boolean;
  match: number | null;
};

const STATUS: Record<Candidato["status"], string> = {
  enviada: "Enviada",
  triagem: "Em triagem",
  selecionada: "Selecionada",
  recusada: "Não selecionada",
};

// Monta um link wa.me com mensagem pré-preenchida (envio manual pela empresa).
function waLink(telefone: string | null, nome: string | null, vagaTitulo: string, empresaNome: string): string | null {
  if (!telefone) return null;
  let digits = telefone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 11 && !digits.startsWith("55")) digits = "55" + digits;
  const primeiro = (nome ?? "").split(" ")[0] || "Olá";
  const msg = `Olá ${primeiro}, aqui é da ${empresaNome} sobre a vaga "${vagaTitulo}". `;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export default async function CandidatosVagaPage({ params }: Props) {
  const { id } = await params;
  const { empresa, supabase } = await requireEmpresa();
  if (!empresa) notFound();

  // Confirma que a vaga é desta empresa (a RPC também checa, mas queremos o título e o 404).
  const { data: vaga } = await supabase
    .from("vagas")
    .select("id,titulo,status,empresa_id")
    .eq("id", id)
    .eq("empresa_id", empresa.id)
    .maybeSingle();
  if (!vaga) notFound();

  const { data, error } = await supabase.rpc("candidatos_da_vaga", { p_vaga_id: id });
  const candidatos = (data as unknown as Candidato[]) || [];
  const empresaNome = empresa.nome ?? "a empresa";

  return (
    <div className="screen" style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <Link href="/painel-empresa" style={{ color: "var(--ink-60)", fontSize: 13 }}>← Voltar ao painel</Link>
      <span className="chapeu" style={{ display: "block", marginTop: 12 }}>Candidatos</span>
      <h1 style={{ fontSize: 26, margin: "6px 0 4px" }}>{vaga.titulo}</h1>
      <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 24 }}>
        {candidatos.length} candidato(s) · ordenados por compatibilidade (IA)
      </p>

      {error && <p className="auth-erro" role="alert">Erro ao carregar candidatos: {error.message}</p>}

      {candidatos.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhuma candidatura ainda para esta vaga.</p>
      ) : (
        <ul style={{ display: "grid", gap: 14, listStyle: "none", padding: 0, margin: 0 }}>
          {candidatos.map((c) => {
            const wa = waLink(c.telefone, c.nome, vaga.titulo, empresaNome);
            return (
              <li key={c.candidatura_id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {typeof c.match === "number" && <MatchRing value={c.match} size={48} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 16 }}>{c.nome || "Candidato"}</strong>
                      <span className="chip">{STATUS[c.status]}</span>
                      {c.tem_curriculo && <span style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}><Icon name="doc" size={13} /> Currículo</span>}
                    </div>
                    <div style={{ color: "var(--ink-60)", fontSize: 13, marginTop: 2 }}>
                      {[c.area, c.cidade].filter(Boolean).join(" · ")}
                    </div>
                    {c.resumo && <p style={{ fontSize: 13.5, margin: "8px 0 0", color: "var(--ink-80, #333)" }}>{c.resumo}</p>}
                    {c.skills && c.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {c.skills.slice(0, 8).map((s) => <span key={s} className="chip">{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
                  <form action={atualizarStatusCandidatura} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="hidden" name="candidatura_id" value={c.candidatura_id} />
                    <input type="hidden" name="vaga_id" value={vaga.id} />
                    <select name="status" defaultValue={c.status} style={{ padding: "6px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13 }}>
                      {(Object.keys(STATUS) as Candidato["status"][]).map((s) => (
                        <option key={s} value={s}>{STATUS[s]}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-ghost btn-sm">Atualizar</button>
                  </form>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      <Icon name="check" size={14} /> WhatsApp
                    </a>
                  ) : (
                    <span style={{ color: "var(--ink-40)", fontSize: 12.5 }}>sem telefone</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
