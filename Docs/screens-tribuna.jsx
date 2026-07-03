// screens-tribuna.jsx — Tribuna do Talento (creator economy para profissionais)
const { useState: useStateT } = React;

function tribunaInitials(nome) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function TribunaMetrics({ post, compact }) {
  const { fmtN } = window;
  return (
    <div className={`trib-metrics ${compact ? "compact" : ""}`}>
      <span title="Leituras"><Icon name="eye" size={compact ? 13 : 15} /> {fmtN(post.leituras)}</span>
      <span title="Curtidas"><Icon name="heart" size={compact ? 13 : 15} /> {fmtN(post.curtidas)}</span>
      <span title="Comentários"><Icon name="chat" size={compact ? 13 : 15} /> {post.comentarios}</span>
    </div>
  );
}

function TribunaCard({ post, go }) {
  return (
    <article className="trib-card" onClick={() => go("tribuna-post", post.id)}>
      <div className="trib-card-top">
        <span className="trib-tipo">{post.tipo}</span>
        {post.viral && <span className="trib-viral"><Icon name="flame" size={12} /> Em alta</span>}
      </div>
      <h3 className="trib-card-title">{post.titulo}</h3>
      <p className="trib-card-lead">{post.lead}</p>
      <div className="trib-card-foot">
        <div className="trib-author">
          <span className="trib-ava">{tribunaInitials(post.autor)}</span>
          <div className="trib-author-info">
            <strong>{post.autor}</strong>
            <span>{post.cargo}</span>
          </div>
        </div>
        <TribunaMetrics post={post} compact />
      </div>
      {post.radar && <div className="trib-radar"><Icon name="shield" size={13} /> Destaque para recrutadores</div>}
    </article>
  );
}

function TribunaScreen({ go, candidatoLogado }) {
  const { TRIBUNA, TRIBUNA_AREAS } = window;
  const [area, setArea] = useStateT("todas");
  const ordenadas = [...TRIBUNA].sort((a, b) => b.leituras - a.leituras);
  const feat = ordenadas[0];
  const lista = ordenadas.slice(1).filter((p) => area === "todas" || p.area === area);

  return (
    <div className="screen tribuna">
      <div className="content-masthead">
        <span className="chapeu">MaringáPost · Tribuna do Talento</span>
        <h1>Seu melhor trabalho merece audiência, não uma gaveta.</h1>
        <p>Profissionais da região publicam análises, opiniões técnicas e portfólios diante dos 350 mil leitores do MaringáPost. O que se destaca na audiência vira vitrine para quem contrata.</p>
      </div>

      {/* Como funciona */}
      <div className="trib-how">
        {[
          { n: "01", ic: "doc", t: "Publique seu trabalho", d: "Artigo de opinião, análise de mercado ou estudo de caso do seu portfólio." },
          { n: "02", ic: "flame", t: "Ganhe a audiência", d: "Seu conteúdo circula entre os 350 mil leitores. O que engaja sobe no feed." },
          { n: "03", ic: "shield", t: "Seja descoberto", d: "Quem viraliza ganha selo de destaque — e cai no radar dos recrutadores." },
        ].map((s) => (
          <div key={s.n} className="trib-how-step">
            <span className="trib-how-n">{s.n}</span>
            <span className="trib-how-ic"><Icon name={s.ic} size={20} /></span>
            <div>
              <strong>{s.t}</strong>
              <p>{s.d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Destaque da semana */}
      {feat && (
        <article className="trib-feature" onClick={() => go("tribuna-post", feat.id)}>
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
                <span className="trib-ava lg">{tribunaInitials(feat.autor)}</span>
                <div className="trib-author-info">
                  <strong>{feat.autor}{feat.disponivel && <span className="trib-open-dot" title="Aberto a propostas" />}</strong>
                  <span>{feat.cargo} · {feat.tempo} de leitura</span>
                </div>
              </div>
              <TribunaMetrics post={feat} />
            </div>
          </div>
        </article>
      )}

      {/* Filtros */}
      <div className="trib-filters">
        <button className={`cf-pill ${area === "todas" ? "on" : ""}`} onClick={() => setArea("todas")}>Todas as áreas</button>
        {TRIBUNA_AREAS.map((a) => (
          <button key={a} className={`cf-pill ${area === a ? "on" : ""}`} onClick={() => setArea(a)}>{a}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="trib-grid">
        {lista.map((p) => <TribunaCard key={p.id} post={p} go={go} />)}
        <div className="trib-cta-card">
          <span className="trib-cta-ic"><Icon name="doc" size={22} /></span>
          <h3>Tem algo que vale ser lido?</h3>
          <p>Publique seu artigo ou portfólio na Tribuna e deixe seu trabalho falar por você diante de quem contrata.</p>
          <Btn variant="primary" icon="arrow" onClick={() => go(candidatoLogado ? "painel-candidato" : "cadastro-candidato")}>
            {candidatoLogado ? "Publicar na Tribuna" : "Criar perfil e publicar"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function TribunaPostScreen({ id, go, candidatoLogado }) {
  const { tribunaById, TRIBUNA, fmtN } = window;
  const post = tribunaById(id) || TRIBUNA[0];
  const relacionados = TRIBUNA.filter((p) => p.id !== post.id && p.area === post.area).slice(0, 2);

  return (
    <div className="screen trib-post">
      <button className="back" onClick={() => go("tribuna")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Tribuna do Talento</button>

      <div className="trib-post-grid">
        <article className="trib-post-main">
          <span className="trib-tipo">{post.tipo} · {post.area}</span>
          <h1>{post.titulo}</h1>
          <p className="artigo-lead">{post.lead}</p>

          <div className="trib-post-byline">
            <span className="trib-ava lg">{tribunaInitials(post.autor)}</span>
            <div className="trib-author-info">
              <strong>{post.autor}</strong>
              <span>{post.cargo} · {post.data} · {post.tempo} de leitura</span>
            </div>
            <div className="trib-post-share"><ShareMenu vaga={{ id: post.id, titulo: post.titulo, cidade: "MaringáPost" }} /></div>
          </div>

          {post.viral && (
            <div className="trib-viral-banner">
              <Icon name="flame" size={18} />
              <p><strong>Este conteúdo viralizou.</strong> Foi um dos mais lidos pelos 350 mil leitores do MaringáPost — e por isso o perfil de {post.autor.split(" ")[0]} ganhou destaque automático para os recrutadores.</p>
            </div>
          )}

          <Placeholder label="imagem do trabalho" ratio="16/9" />

          <div className="artigo-text trib-post-text">
            {post.corpo.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="trib-post-reactions">
            <button className="trib-react"><Icon name="heart" size={17} /> {fmtN(post.curtidas)}</button>
            <button className="trib-react"><Icon name="chat" size={17} /> {post.comentarios}</button>
            <span className="trib-react-views"><Icon name="eye" size={16} /> {fmtN(post.leituras)} leituras</span>
          </div>
        </article>

        <aside className="trib-post-aside">
          <div className="trib-profile-card">
            <span className="trib-ava xl">{tribunaInitials(post.autor)}</span>
            <strong className="trib-profile-name">{post.autor}</strong>
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
            <Btn variant="primary" full icon="arrow" onClick={() => go(candidatoLogado ? "painel-candidato" : "cadastro-candidato")}>Ver perfil completo</Btn>
            <button className="save-row" onClick={() => go("empresa")}><Icon name="users" size={16} /> Convidar para uma vaga</button>
            <p className="trib-recruiter-note">Recrutadores: você está vendo o trabalho real do candidato — não um currículo genérico.</p>
          </div>

          {relacionados.length > 0 && (
            <div className="trib-related">
              <p className="trib-related-title">Mais em {post.area}</p>
              {relacionados.map((r) => (
                <button key={r.id} className="aside-art" onClick={() => go("tribuna-post", r.id)}>
                  <span className="aside-art-chapeu">{r.tipo}</span>
                  <span className="aside-art-title">{r.titulo}</span>
                  <span className="aside-art-meta">{r.autor} · {window.fmtN(r.leituras)} leituras</span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { TribunaScreen, TribunaPostScreen });
