import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Placeholder } from "@/components/ui";
import { TribunaGrid } from "@/components/TribunaGrid";
import { getTribuna } from "@/data/tribuna";
import { fmtN } from "@/lib/refs";

export const metadata: Metadata = {
  title: "Tribuna do Talento",
  description: "Profissionais da região publicam análises, opiniões e portfólios diante dos leitores do MaringáPost.",
};

const initials = (nome: string) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export default async function TribunaPage() {
  const posts = await getTribuna(); // já ordenado por leituras (desc)
  const feat = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="screen tribuna">
      <div className="content-masthead">
        <span className="chapeu">MaringáPost · Tribuna do Talento</span>
        <h1>Seu melhor trabalho merece audiência, não uma gaveta.</h1>
        <p>Profissionais da região publicam análises, opiniões técnicas e portfólios diante dos 350 mil leitores do MaringáPost. O que se destaca na audiência vira vitrine para quem contrata.</p>
      </div>

      <div className="trib-how">
        {[
          { n: "01", ic: "doc", t: "Publique seu trabalho", d: "Artigo de opinião, análise de mercado ou estudo de caso do seu portfólio." },
          { n: "02", ic: "flame", t: "Ganhe a audiência", d: "Seu conteúdo circula entre os 350 mil leitores. O que engaja sobe no feed." },
          { n: "03", ic: "shield", t: "Seja descoberto", d: "Quem viraliza ganha selo de destaque — e cai no radar dos recrutadores." },
        ].map((s) => (
          <div key={s.n} className="trib-how-step">
            <span className="trib-how-n">{s.n}</span>
            <span className="trib-how-ic"><Icon name={s.ic} size={20} /></span>
            <div><strong>{s.t}</strong><p>{s.d}</p></div>
          </div>
        ))}
      </div>

      {feat && (
        <Link className="trib-feature" href={`/tribuna-post/${feat.id}`}>
          <div className="trib-feature-media">
            <Placeholder label="capa do trabalho" ratio="4/3" />
            <span className="trib-feature-flag"><Icon name="flame" size={13} /> Mais lido da semana</span>
          </div>
          <div className="trib-feature-body">
            <span className="trib-tipo">{feat.tipo} · {feat.area}</span>
            <h2>{feat.titulo}</h2>
            <p>{feat.lead}</p>
            <div className="trib-feature-foot">
              <div className="trib-author">
                <span className="trib-ava lg">{initials(feat.autor_nome)}</span>
                <div className="trib-author-info">
                  <strong>{feat.autor_nome}{feat.disponivel && <span className="trib-open-dot" title="Aberto a propostas" />}</strong>
                  <span>{feat.cargo}</span>
                </div>
              </div>
              <div className="trib-metrics">
                <span><Icon name="eye" size={15} /> {fmtN(feat.leituras)}</span>
                <span><Icon name="heart" size={15} /> {fmtN(feat.curtidas)}</span>
                <span><Icon name="chat" size={15} /> {feat.comentarios}</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      <TribunaGrid posts={rest} />
    </div>
  );
}
