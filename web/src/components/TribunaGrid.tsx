"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { fmtN, TRIBUNA_AREAS } from "@/lib/refs";
import type { TribunaPost } from "@/data/types";

function initials(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function TribunaCard({ post }: { post: TribunaPost }) {
  return (
    <Link className="trib-card" href={`/tribuna-post/${post.id}`}>
      <div className="trib-card-top">
        <span className="trib-tipo">{post.tipo}</span>
        {post.viral && <span className="trib-viral"><Icon name="flame" size={12} /> Em alta</span>}
      </div>
      <h3 className="trib-card-title">{post.titulo}</h3>
      <p className="trib-card-lead">{post.lead}</p>
      <div className="trib-card-foot">
        <div className="trib-author">
          <span className="trib-ava">{initials(post.autor_nome)}</span>
          <div className="trib-author-info">
            <strong>{post.autor_nome}</strong>
            <span>{post.cargo}</span>
          </div>
        </div>
        <div className="trib-metrics compact">
          <span title="Leituras"><Icon name="eye" size={13} /> {fmtN(post.leituras)}</span>
          <span title="Curtidas"><Icon name="heart" size={13} /> {fmtN(post.curtidas)}</span>
          <span title="Comentários"><Icon name="chat" size={13} /> {post.comentarios}</span>
        </div>
      </div>
      {post.radar && <div className="trib-radar"><Icon name="shield" size={13} /> Destaque para recrutadores</div>}
    </Link>
  );
}

export function TribunaGrid({ posts }: { posts: TribunaPost[] }) {
  const [area, setArea] = useState("todas");
  const lista = posts.filter((p) => area === "todas" || p.area === area);

  return (
    <>
      <div className="trib-filters">
        <button className={`cf-pill ${area === "todas" ? "on" : ""}`} onClick={() => setArea("todas")}>Todas as áreas</button>
        {TRIBUNA_AREAS.map((a) => (
          <button key={a} className={`cf-pill ${area === a ? "on" : ""}`} onClick={() => setArea(a)}>{a}</button>
        ))}
      </div>

      <div className="trib-grid">
        {lista.map((p) => <TribunaCard key={p.id} post={p} />)}
        <div className="trib-cta-card">
          <span className="trib-cta-ic"><Icon name="doc" size={22} /></span>
          <h3>Tem algo que vale ser lido?</h3>
          <p>Publique seu artigo ou portfólio na Tribuna e deixe seu trabalho falar por você diante de quem contrata.</p>
          <Link href="/cadastro-candidato" className="btn btn-primary"><Icon name="arrow" size={16} /> Criar perfil e publicar</Link>
        </div>
      </div>
    </>
  );
}
