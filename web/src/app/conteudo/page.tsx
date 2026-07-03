import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/ui";
import { getPublicacoes, tempoLeitura } from "@/data/publicacoes";
import type { PublicacaoComEmpresa } from "@/data/types";

export const metadata: Metadata = {
  title: "Carreira & RH",
  description: "Jornalismo do MaringáPost sobre carreira, empresas e mercado de trabalho no Norte do Paraná.",
};

function PubMeta({ pub }: { pub: PublicacaoComEmpresa }) {
  return (
    <span className="byline">
      {pub.empresa ? `Conteúdo de marca · ${pub.empresa.nome}` : "Redação MaringáPost"} · {tempoLeitura(pub.corpo)} de leitura
    </span>
  );
}

export default async function ConteudoPage() {
  const aprovadas = await getPublicacoes();
  const feat = aprovadas[0];
  const rest = aprovadas.slice(1);

  return (
    <div className="screen content">
      <div className="content-masthead">
        <span className="chapeu">MaringáPost · Carreira & RH</span>
        <h1>Jornalismo que ajuda você a crescer.</h1>
        <p>Bastidores das empresas que contratam, cultura e carreira — conteúdo das empresas parceiras, com a curadoria da redação do MaringáPost.</p>
      </div>

      {feat && (
        <Link className="feature-art" href={`/artigo/${feat.id}`}>
          <Placeholder label="foto de capa — reportagem" ratio="21/9" />
          <div className="feature-body">
            <span className="chapeu">{feat.chapeu}</span>
            <h2>{feat.titulo}</h2>
            <p>{feat.lead}</p>
            <PubMeta pub={feat} />
          </div>
        </Link>
      )}

      <div className="art-grid">
        {rest.map((a) => (
          <Link key={a.id} className="art-card" href={`/artigo/${a.id}`}>
            <Placeholder label="imagem do artigo" ratio="16/10" />
            <span className="chapeu">{a.chapeu}</span>
            <h3>{a.titulo}</h3>
            <p>{a.lead}</p>
            <PubMeta pub={a} />
          </Link>
        ))}
        <div className="art-card promo">
          <span className="chapeu light">Para empresas</span>
          <h3>Sua marca empregadora numa reportagem do MaringáPost.</h3>
          <p>Empresas parceiras publicam aqui — com a curadoria editorial que dá credibilidade à sua marca.</p>
          <Link href="/pacotes" className="btn btn-primary">Conhecer planos</Link>
        </div>
      </div>
    </div>
  );
}
