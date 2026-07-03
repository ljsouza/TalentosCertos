import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { empresaById, vagasDaEmpresa } from "@/data/empresas";
import { Icon } from "@/components/Icon";
import { CompanyMark, RespondeBadge } from "@/components/ui";
import { JobCard } from "@/components/JobCard";

// Next 16: params é uma Promise — precisa await.
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const e = await empresaById(id);
  if (!e) return { title: "Empresa não encontrada" };
  const desc = e.sobre ?? `Vagas e perfil de ${e.nome} no MaringáPost Empregos.`;
  return {
    title: e.nome,
    description: desc,
    openGraph: { title: e.nome, description: desc, type: "profile" },
  };
}

export default async function EmpresaPerfilPage({ params }: Props) {
  const { id } = await params;
  const e = await empresaById(id);
  if (!e) notFound();
  const vagas = await vagasDaEmpresa(id);

  // Linha de dados institucionais — só mostra o que está preenchido.
  const dados: { icon: string; label: string }[] = [];
  if (e.fundada) dados.push({ icon: "clock", label: `Fundada em ${e.fundada}` });
  if (e.funcionarios) dados.push({ icon: "users", label: `${e.funcionarios} pessoas` });
  if (e.endereco) dados.push({ icon: "pin", label: e.endereco });

  return (
    <div className="screen detail">
      <Link className="back" href="/">
        <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Voltar às vagas
      </Link>

      <div className="detail-head">
        <CompanyMark empresa={e} size={62} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="detail-co">
            {e.setor}
            {e.verificada && <span className="verif"><Icon name="shield" size={14} /> Verificada</span>}
          </div>
          <h1 className="detail-title">{e.nome}</h1>
          <div className="detail-meta">
            {dados.map((d, i) => <span key={i}><Icon name={d.icon} size={16} /> {d.label}</span>)}
          </div>
        </div>
      </div>

      <div className="detail-chips">
        {e.responde && <RespondeBadge tempo={e.tempo_resposta} />}
        {e.site && (
          <a href={e.site} target="_blank" rel="noopener noreferrer" className="chip">
            <Icon name="globe" size={13} /> Site oficial
          </a>
        )}
      </div>

      {(e.sobre_longo || e.sobre) && (
        <section className="detail-block">
          <h2>Sobre a empresa</h2>
          <p>{e.sobre_longo || e.sobre}</p>
        </section>
      )}

      {e.destaques.length > 0 && (
        <section className="detail-block">
          <h2>Por que trabalhar aqui</h2>
          <ul className="check-list">
            {e.destaques.map((d, i) => <li key={i}><Icon name="check" size={16} stroke={2.4} /> {d}</li>)}
          </ul>
        </section>
      )}

      {e.video_youtube && (
        <section className="detail-block">
          <h2>Conheça a empresa</h2>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden" }}>
            <iframe
              src={e.video_youtube.replace("watch?v=", "embed/")}
              title={`Vídeo institucional de ${e.nome}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        </section>
      )}

      <section className="detail-block">
        <h2>Vagas abertas ({vagas.length})</h2>
        {vagas.length === 0 ? (
          <p style={{ color: "var(--ink-60)" }}>Nenhuma vaga aberta no momento.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {vagas.map((v) => <JobCard key={v.id} vaga={v} density="compact" />)}
          </div>
        )}
      </section>
    </div>
  );
}
