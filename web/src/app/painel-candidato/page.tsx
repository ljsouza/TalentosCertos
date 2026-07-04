import type { Metadata } from "next";
import Link from "next/link";
import { requireCandidato } from "@/lib/auth";
import { PerfilForm } from "@/components/PerfilForm";
import { JobCard } from "@/components/JobCard";
import { ExcluirContaButton } from "@/components/ExcluirContaButton";
import { getTaxonomias } from "@/lib/tenant";
import type { VagaComEmpresa } from "@/data/types";

export const metadata: Metadata = { title: "Minha conta" };

const STATUS_LABEL: Record<string, string> = {
  enviada: "Enviada",
  triagem: "Em triagem",
  selecionada: "Selecionada",
  recusada: "Não selecionada",
};

type Candidatura = {
  id: string;
  status: string;
  criado_em: string;
  vaga: { id: string; titulo: string; cidade: string | null; empresa: { nome: string } | null } | null;
};

export default async function PainelCandidatoPage() {
  const { perfil, user, supabase } = await requireCandidato();
  const { areas, cidades } = await getTaxonomias();

  const [{ data: candData }, { data: savData }, { data: cand }] = await Promise.all([
    supabase
      .from("candidaturas")
      .select("id,status,criado_em,vaga:vagas(id,titulo,cidade,empresa:empresas(nome))")
      .eq("candidato_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase
      .from("vagas_salvas")
      .select("vaga:vagas(id,titulo,cidade,empresa:empresas(nome))")
      .eq("candidato_id", user.id)
      .order("criado_em", { ascending: false }),
    supabase.from("candidatos").select("area,cidade,resumo,skills,curriculo_url").eq("id", user.id).maybeSingle(),
  ]);
  const candidaturas = (candData as unknown as Candidatura[]) || [];
  const salvas = ((savData as unknown as { vaga: Candidatura["vaga"] }[]) || []).map((s) => s.vaga).filter(Boolean);
  const perfilInicial = {
    nome: perfil?.nome || "",
    area: cand?.area || "",
    cidade: cand?.cidade || "",
    resumo: cand?.resumo || "",
    skills: (cand?.skills as string[] | null) || [],
    curriculoUrl: (cand?.curriculo_url as string | null) || null,
  };

  // Match semântico: vagas recomendadas pelo embedding do perfil.
  const { data: recs } = await supabase.rpc("vagas_recomendadas", { match_count: 6 });
  const recList = (recs as { id: string; similaridade: number }[] | null) || [];
  let recomendadas: { vaga: VagaComEmpresa; match: number }[] = [];
  if (recList.length) {
    const { data: vs } = await supabase
      .from("vagas")
      .select("*, empresa:empresas(id,nome,setor,verificada,responde,tempo_resposta,logo_url)")
      .in("id", recList.map((r) => r.id));
    const byId = new Map(((vs as unknown as VagaComEmpresa[]) || []).map((v) => [v.id, v]));
    recomendadas = recList
      .map((r) => ({ vaga: byId.get(r.id), match: Math.round(r.similaridade * 100) }))
      .filter((x): x is { vaga: VagaComEmpresa; match: number } => Boolean(x.vaga));
  }
  const savedIds = new Set(salvas.map((s) => s!.id));

  return (
    <div className="screen" style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
      <span className="chapeu">Sua conta</span>
      <h1 style={{ fontSize: 28, margin: "6px 0 24px" }}>Olá, {perfil?.nome?.split(" ")[0]}</h1>

      {recomendadas.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Vagas recomendadas para você</h2>
          <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 14 }}>Por similaridade entre seu perfil e as vagas (IA).</p>
          <div className="job-grid regular" style={{ marginBottom: 32 }}>
            {recomendadas.map(({ vaga, match }) => (
              <JobCard key={vaga.id} vaga={vaga} logado match={match} podeSalvar saved={savedIds.has(vaga.id)} />
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Meu perfil</h2>
      <p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 14 }}>Cole seu currículo ou envie um PDF — a IA preenche para você. Edite e salve.</p>
      <PerfilForm inicial={perfilInicial} areas={areas} cidades={cidades} />

      <h2 style={{ fontSize: 18, margin: "32px 0 12px" }}>Minhas candidaturas ({candidaturas.length})</h2>
      {candidaturas.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>
          Você ainda não se candidatou a nenhuma vaga. <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>Ver vagas abertas</Link>.
        </p>
      ) : (
        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
          {candidaturas.map((c) => (
            <li key={c.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {c.vaga ? <Link href={`/vaga/${c.vaga.id}`} style={{ fontWeight: 600 }}>{c.vaga.titulo}</Link> : <span>Vaga removida</span>}
                <div style={{ color: "var(--ink-60)", fontSize: 13 }}>{c.vaga?.empresa?.nome}{c.vaga?.cidade ? ` · ${c.vaga.cidade}` : ""}</div>
              </div>
              <span className="chip">{STATUS_LABEL[c.status] || c.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: 18, margin: "32px 0 12px" }}>Vagas salvas ({salvas.length})</h2>
      {salvas.length === 0 ? (
        <p style={{ color: "var(--ink-60)" }}>Nenhuma vaga salva. Toque no marcador nos cards para salvar.</p>
      ) : (
        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
          {salvas.map((v) => (
            <li key={v!.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
              <Link href={`/vaga/${v!.id}`} style={{ fontWeight: 600 }}>{v!.titulo}</Link>
              <div style={{ color: "var(--ink-60)", fontSize: 13 }}>{v!.empresa?.nome}{v!.cidade ? ` · ${v!.cidade}` : ""}</div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ fontSize: 18, margin: "40px 0 8px" }}>Privacidade</h2>
      <p style={{ color: "var(--ink-60)", fontSize: 13.5, marginBottom: 12 }}>
        Você pode excluir sua conta e todos os seus dados a qualquer momento (LGPD). Veja como tratamos seus dados na{" "}
        <Link href="/privacidade" style={{ color: "var(--accent)", fontWeight: 600 }}>Política de Privacidade</Link>.
      </p>
      <ExcluirContaButton />
    </div>
  );
}
