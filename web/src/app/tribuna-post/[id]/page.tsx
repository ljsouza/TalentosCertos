import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Placeholder } from "@/components/ui";
import { ShareMenu } from "@/components/ShareMenu";
import { getTribuna, tribunaById } from "@/data/tribuna";
import { fmtN } from "@/lib/refs";

type Props = { params: Promise<{ id: string }> };

const initials = (nome: string) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await tribunaById(id);
  if (!post) return { title: "Publicação não encontrada" };
  const desc = post.lead ?? post.titulo;
  return { title: post.titulo, description: desc, openGraph: { title: post.titulo, description: desc, type: "article" } };
}

export default async function TribunaPostPage({ params }: Props) {
  const { id } = await params;
  const post = await tribunaById(id);
  if (!post) notFound();

  const todos = await getTribuna();
  const relacionados = todos.filter((p) => p.id !== post.id && p.area === post.area).slice(0, 2);

  return (
    <div className="screen trib-post">
      <Link className="back" href="/tribuna"><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Tribuna do Talento</Link>

      <div className="trib-post-grid">
        <article className="trib-post-main">
          <span className="trib-tipo">{post.tipo} · {post.area}</span>
          <h1>{post.titulo}</h1>
          <p className="artigo-lead">{post.lead}</p>

          <div className="trib-post-byline">
            <span className="trib-ava lg">{initials(post.autor_nome)}</span>
            <div className="trib-author-info">
              <strong>{post.autor_nome}</strong>
              <span>{post.cargo}</span>
            </div>
            <div className="trib-post-share"><ShareMenu vaga={{ id: post.id, titulo: post.titulo, cidade: "MaringáPost" }} path="/tribuna-post" /></div>
          </div>

          {post.viral && (
            <div className="trib-viral-banner">
              <Icon name="flame" size={18} />
              <p><strong>Este conteúdo viralizou.</strong> Foi um dos mais lidos pelos 350 mil leitores do MaringáPost — e por isso o perfil de {post.autor_nome.split(" ")[0]} ganhou destaque automático para os recrutadores.</p>
            </div>
          )}

          <Placeholder label="imagem do trabalho" ratio="16/9" />

          <div className="artigo-text trib-post-text">
            {post.corpo.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="trib-post-reactions">
            <span className="trib-react"><Icon name="heart" size={17} /> {fmtN(post.curtidas)}</span>
            <span className="trib-react"><Icon name="chat" size={17} /> {post.comentarios}</span>
            <span className="trib-react-views"><Icon name="eye" size={16} /> {fmtN(post.leituras)} leituras</span>
          </div>
        </article>

        <aside className="trib-post-aside">
          <div className="trib-profile-card">
            <span className="trib-ava xl">{initials(post.autor_nome)}</span>
            <strong className="trib-profile-name">{post.autor_nome}</strong>
            <span className="trib-profile-cargo">{post.cargo}</span>
            {post.radar && <div className="trib-radar solo"><Icon name="shield" size={13} /> Destaque para recrutadores</div>}
            {post.disponivel
              ? <div className="trib-open-badge"><span className="trib-open-dot" /> Aberto a propostas</div>
              : <div className="trib-closed-badge">Não está em busca ativa</div>}
            <div className="trib-profile-stats">
              <div><strong>{fmtN(post.leituras)}</strong><span>leituras</span></div>
              <div><strong>{fmtN(post.curtidas)}</strong><span>curtidas</span></div>
              <div><strong>{post.comentarios}</strong><span>comentários</span></div>
            </div>
            <Link href="/cadastro-candidato" className="btn btn-primary btn-full"><Icon name="arrow" size={16} /> Ver perfil completo</Link>
            <Link href="/empresa" className="save-row"><Icon name="users" size={16} /> Convidar para uma vaga</Link>
            <p className="trib-recruiter-note">Recrutadores: você está vendo o trabalho real do candidato — não um currículo genérico.</p>
          </div>

          {relacionados.length > 0 && (
            <div className="trib-related">
              <p className="trib-related-title">Mais em {post.area}</p>
              {relacionados.map((r) => (
                <Link key={r.id} className="aside-art" href={`/tribuna-post/${r.id}`}>
                  <span className="aside-art-chapeu">{r.tipo}</span>
                  <span className="aside-art-title">{r.titulo}</span>
                  <span className="aside-art-meta">{r.autor_nome} · {fmtN(r.leituras)} leituras</span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
