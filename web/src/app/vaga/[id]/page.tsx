import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { vagaById } from "@/data/vagas";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/Icon";
import { CompanyMark, ModalidadeBadge, TypeBadge, RespondeBadge } from "@/components/ui";
import { ShareMenu } from "@/components/ShareMenu";
import { VagaApplyCard } from "@/components/VagaApplyCard";

// Next 16: params é uma Promise — precisa await.
type Props = { params: Promise<{ id: string }> };

// generateMetadata roda NO SERVIDOR: cada vaga ganha title, description e
// Open Graph próprios → indexação no Google e preview rico ao compartilhar.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vaga = await vagaById(id);
  if (!vaga) return { title: "Vaga não encontrada" };
  const desc = vaga.descricao ?? `Vaga de ${vaga.titulo} em ${vaga.cidade}.`;
  return {
    title: vaga.titulo,
    description: desc,
    openGraph: { title: vaga.titulo, description: desc, type: "article" },
  };
}

export default async function VagaPage({ params }: Props) {
  const { id } = await params;
  const vaga = await vagaById(id);
  if (!vaga) notFound();
  const e = vaga.empresa;

  // Já se candidatou? (só relevante para candidato logado)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let jaAplicou = false;
  let jaSalvou = false;
  let podeSalvar = false;
  if (user) {
    const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
    podeSalvar = perfil?.papel === "candidato";
    if (podeSalvar) {
      const [{ data: cand }, { data: sav }] = await Promise.all([
        supabase.from("candidaturas").select("id").eq("vaga_id", id).eq("candidato_id", user.id).maybeSingle(),
        supabase.from("vagas_salvas").select("vaga_id").eq("vaga_id", id).eq("candidato_id", user.id).maybeSingle(),
      ]);
      jaAplicou = Boolean(cand);
      jaSalvou = Boolean(sav);
    }
  }

  return (
    <div className="screen detail">
      <Link className="back" href="/">
        <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Voltar às vagas
      </Link>
      <div className="detail-grid">
        <main className="detail-main">
          <div className="detail-head">
            <CompanyMark empresa={e} size={62} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="detail-co">
                {e?.nome}
                {e?.verificada && <span className="verif"><Icon name="shield" size={14} /> Verificada</span>}
              </div>
              <h1 className="detail-title">{vaga.titulo}</h1>
              <div className="detail-meta">
                <span><Icon name="pin" size={16} /> {vaga.cidade}</span>
                {e?.responde && <span><Icon name="check" size={16} /> Responde · {e.tempo_resposta}</span>}
              </div>
            </div>
            <ShareMenu vaga={vaga} />
          </div>

          <div className="detail-chips">
            {vaga.modalidade && <ModalidadeBadge modalidade={vaga.modalidade} />}
            {vaga.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
            {vaga.experiencia && <span className="chip">{vaga.experiencia}</span>}
            {vaga.filtro_formato && (
              <span className="chip chip-arf">
                <Icon name={vaga.filtro_formato === "video" ? "video" : "mic"} size={13} /> Resposta ativa · 30s
              </span>
            )}
            {e?.responde && <RespondeBadge tempo={e.tempo_resposta} />}
          </div>

          {vaga.descricao && (
            <section className="detail-block">
              <h2>Sobre a vaga</h2>
              <p>{vaga.descricao}</p>
            </section>
          )}

          {vaga.requisitos.length > 0 && (
            <section className="detail-block">
              <h2>O que esperamos</h2>
              <ul className="check-list">
                {vaga.requisitos.map((r, i) => <li key={i}><Icon name="check" size={16} stroke={2.4} /> {r}</li>)}
              </ul>
            </section>
          )}

          {vaga.beneficios.length > 0 && (
            <section className="detail-block">
              <h2>Benefícios</h2>
              <div className="benefits">
                {vaga.beneficios.map((b, i) => <span key={i} className="benefit">{b}</span>)}
              </div>
            </section>
          )}
        </main>

        <aside className="detail-aside">
          <VagaApplyCard vaga={vaga} jaAplicou={jaAplicou} jaSalvou={jaSalvou} podeSalvar={podeSalvar} />
          {e && (
            <Link className="co-aside" href={`/empresa-perfil/${e.id}`} title={`Ver perfil de ${e.nome}`}>
              <CompanyMark empresa={e} size={40} />
              <div>
                <strong>{e.nome}</strong>
                <span>{e.setor}</span>
              </div>
              <Icon name="arrow" size={16} style={{ marginLeft: "auto", color: "var(--ink-40)" }} />
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
