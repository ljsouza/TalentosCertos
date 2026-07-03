// screens-public.jsx — Home/busca, vaga detail, conteúdo RH
const { useState: useStateP, useMemo } = React;

function HomeScreen({ go, density, saved, toggleSave, tone, candidatoLogado }) {
  const { VAGAS, AREAS, CIDADES, ARTIGOS } = window;
  const [q, setQ] = useStateP("");
  const [area, setArea] = useStateP("");
  const [cidade, setCidade] = useStateP("");
  const [sort, setSort] = useStateP("recente");

  const today = new Date(); today.setHours(0,0,0,0);
  const vagaAtiva = (v) => {
    if (v.prazo) { const d = new Date(v.prazo + 'T12:00:00'); if (d < today) return false; }
    return true;
  };

  const list = useMemo(() => {
    let l = VAGAS.filter((v) =>
      vagaAtiva(v) &&
      (!q || (v.titulo + v.descricao).toLowerCase().includes(q.toLowerCase())) &&
      (!area || v.area === area) && (!cidade || v.cidade === cidade));
    l = [...l].sort((a, b) => sort === "salario" ? (b.salarioMin || 0) - (a.salarioMin || 0) : (a.postada === "Hoje" ? -1 : 1));
    return l;
  }, [q, area, cidade, sort]);

  return (
    <div className="screen">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <span className="chapeu">Portal de Empregos · Maringá e região</span>
          <h1 className="hero-title">O trabalho certo tem endereço aqui.</h1>
          <p className="hero-sub">Vagas verificadas, empresas que respondem e o jornalismo do MaringáPost sobre carreira — em um só lugar.</p>
          <div className="searchbar">
            <div className="sb-field grow">
              <Icon name="search" size={20} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cargo, palavra-chave ou empresa" />
            </div>
            <div className="sb-field">
              <Icon name="pin" size={18} />
              <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
                <option value="">Toda a região</option>
                {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Btn icon="search" onClick={() => {}}>Buscar</Btn>
          </div>
          <div className="hero-stats">
            <span><strong>1.248</strong> vagas abertas</span>
            <span className="dot" />
            <span><strong>312</strong> empresas</span>
            <span className="dot" />
            <span><strong>89%</strong> respondem candidatos</span>
          </div>
        </div>
      </section>

      <PartnerBanner go={go} />

      {/* Area pills */}
      <div className="area-rail">
        <button className={`pill ${!area ? "on" : ""}`} onClick={() => setArea("")}>Todas as áreas</button>
        {AREAS.slice(0, 8).map((a) => (
          <button key={a} className={`pill ${area === a ? "on" : ""}`} onClick={() => setArea(a === area ? "" : a)}>{a}</button>
        ))}
      </div>

      {/* Results + sidebar */}
      <section className="results-wrap">
        <div className="results-main">
          <div className="results-bar">
            <h2 className="results-count">{list.length} vagas {area && `em ${area}`}{cidade && ` · ${cidade}`}</h2>
            <div className="sort">
              <span>Ordenar:</span>
              <button className={sort === "recente" ? "on" : ""} onClick={() => setSort("recente")}>Recentes</button>
              <button className={sort === "salario" ? "on" : ""} onClick={() => setSort("salario")}>Maior salário</button>
            </div>
          </div>
          <div className={`job-grid ${density}`}>
            {list.map((v) => (
              <JobCard key={v.id} vaga={v} density={density} onOpen={(id) => go("vaga", id)} onSave={toggleSave} saved={saved.includes(v.id)} logado={candidatoLogado} />
            ))}
          </div>
        </div>

        <aside className="results-aside">
          <div className="aside-card map-card">
            <SectionHead chapeu="Novidade" titulo="Vagas no mapa" />
            <MiniMap go={go} />
          </div>
          <div className="aside-card">
            <SectionHead chapeu="MaringáPost · Carreira" titulo="Leituras de RH" action={<button className="link" onClick={() => go("conteudo")}>Ver tudo</button>} />
            <div className="aside-arts">
              {ARTIGOS.map((a) => (
                <button key={a.id} className="aside-art" onClick={() => go("conteudo")}>
                  <span className="aside-art-chapeu">{a.chapeu}</span>
                  <span className="aside-art-title">{a.titulo}</span>
                  <span className="aside-art-meta">{a.tempo} de leitura</span>
                </button>
              ))}
            </div>
          </div>
          <div className="aside-card cta-card">
            <h3>É uma empresa?</h3>
            <p>Publique vagas, ganhe o selo de verificada e alcance os melhores talentos da região.</p>
            <Btn variant="primary" full icon="arrow" onClick={() => go("pacotes")}>Ver planos</Btn>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MiniMap({ go }) {
  const pins = [
    { x: 30, y: 35, n: 14 }, { x: 62, y: 28, n: 9 }, { x: 48, y: 58, n: 22 },
    { x: 75, y: 62, n: 6 }, { x: 22, y: 70, n: 11 },
  ];
  return (
    <button className="minimap" onClick={() => go("home")} aria-label="Abrir mapa de vagas">
      <div className="minimap-grid" />
      {pins.map((p, i) => (
        <span key={i} className="map-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.n}</span>
      ))}
      <span className="minimap-cap"><Icon name="map" size={15} /> 9 regiões de Maringá</span>
    </button>
  );
}

function VagaScreen({ id, go, saved, toggleSave, candidatoLogado }) {
  const v = window.vagaById(id) || window.VAGAS[0];
  const e = window.empById(v.empresa);
  const [applied, setApplied] = useStateP(false);
  const [responding, setResponding] = useStateP(false);
  const apply = () => v.filtroAtivo ? setResponding(true) : setApplied(true);
  return (
    <div className="screen detail">
      <button className="back" onClick={() => go("home")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Voltar às vagas</button>
      <div className="detail-grid">
        <main className="detail-main">
          <div className="detail-head">
            <CompanyMark empresa={e} size={62} />
            <div style={{flex:1,minWidth:0}}>
              <div className="detail-co">{e.nome}{e.verificada && <span className="verif"><Icon name="shield" size={14} /> Verificada</span>}</div>
              <h1 className="detail-title">{v.titulo}</h1>
              <div className="detail-meta">
                <span><Icon name="pin" size={16} /> {v.cidade}</span>
                <span><Icon name="clock" size={16} /> Publicada {v.postada.toLowerCase()}</span>
                <span><Icon name="users" size={16} /> {v.candidatos} candidatos</span>
              </div>
            </div>
            <ShareMenu vaga={v} />
          </div>
          <div className="detail-chips">
            {v.modalidade && <ModalidadeBadge modalidade={v.modalidade} />}
            {v.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
            <span className="chip">{v.exp}</span>
            {v.filtroAtivo && <span className="chip chip-arf"><Icon name={v.filtroAtivo.formato === "video" ? "video" : "mic"} size={13} /> Resposta ativa · 30s</span>}
            {e.responde && <RespondeBadge tempo={e.tempoResposta} />}
          </div>
          <section className="detail-block">
            <h2>Sobre a vaga</h2>
            <p>{v.descricao}</p>
          </section>
          <section className="detail-block">
            <h2>O que esperamos</h2>
            <ul className="check-list">{v.requisitos.map((r, i) => <li key={i}><Icon name="check" size={16} stroke={2.4} /> {r}</li>)}</ul>
          </section>
          <section className="detail-block">
            <h2>Benefícios</h2>
            <div className="benefits">{v.beneficios.map((b, i) => <span key={i} className="benefit">{b}</span>)}</div>
          </section>
        </main>
        <aside className="detail-aside">
          <div className="apply-card">
            {candidatoLogado ? (
              <div className="apply-match">
                <MatchRing value={v.match} size={58} />
                <div>
                  <strong>{v.match}% compatível</strong>
                  <span>com seu perfil</span>
                </div>
              </div>
            ) : (
              <div className="apply-match apply-match-locked">
                <div className="match-lock-lg" title="Faça login para ver compatibilidade">
                  <svg width={58} height={58}>
                    <circle cx={29} cy={29} r={26} fill="none" stroke="var(--line)" strokeWidth="4" strokeDasharray="30 134" strokeLinecap="round" />
                  </svg>
                  <Icon name="bookmark" size={18} stroke={1.5} style={{color:'var(--ink-40)'}} />
                </div>
                <div>
                  <strong style={{color:'var(--ink-60)'}}>Veja sua compatibilidade</strong>
                  <span>Faça login para descobrir</span>
                </div>
              </div>
            )}
            <div className="apply-sal"><Money min={v.salarioMin} max={v.salarioMax} /></div>
            {applied ? (
              <div className="applied-ok"><Icon name="check" size={20} stroke={2.4} /> Candidatura enviada!</div>
            ) : responding ? (
              <ActiveResponseFilter vaga={v} onDone={() => { setApplied(true); setResponding(false); }} onCancel={() => setResponding(false)} />
            ) : (
              <>
                {v.filtroAtivo && <p className="arf-gate-note"><Icon name={v.filtroAtivo.formato === "video" ? "video" : "mic"} size={14} /> Esta vaga pede uma resposta de 30s para concluir a candidatura.</p>}
                <Btn full icon="bolt" onClick={apply}>Candidatar em 1 clique</Btn>
                <Btn variant="dark" full icon="whatsapp" onClick={apply}>Via WhatsApp</Btn>
              </>
            )}
            <button className={`save-row ${saved.includes(v.id) ? "on" : ""}`} onClick={() => toggleSave(v.id)}>
              <Icon name="bookmark" size={17} /> {saved.includes(v.id) ? "Vaga salva" : "Salvar vaga"}
            </button>
            <p className="apply-note">Anexamos automaticamente o currículo do seu cadastro (PDF ou LinkedIn). <button className="link" onClick={() => go("cadastro-candidato")}>Ainda não tem? Cadastre-se</button></p>
          </div>
          <button className="co-aside" onClick={() => go("empresa-perfil", e.id)} title={`Ver perfil de ${e.nome}`}>
            <CompanyMark empresa={e} size={40} />
            <div>
              <strong>{e.nome}</strong>
              <span>{e.setor} · {e.vagasAbertas} vagas abertas</span>
            </div>
            <Icon name="arrow" size={16} style={{ marginLeft: "auto", color: "var(--ink-40)" }} />
          </button>
        </aside>
      </div>
    </div>
  );
}

function ConteudoScreen({ go, pubs }) {
  const aprovadas = (pubs || window.PUBLICACOES).filter((p) => p.status === "aprovada");
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
        <article className="feature-art" onClick={() => go("artigo", feat.id)}>
          {feat.img
            ? <img className="feature-img" src={feat.img} alt={feat.titulo} />
            : <Placeholder label="foto de capa — reportagem" ratio="21/9" />}
          <div className="feature-body">
            <span className="chapeu">{feat.chapeu}</span>
            <h2>{feat.titulo}</h2>
            <p>{feat.lead}</p>
            <PubMeta pub={feat} />
          </div>
        </article>
      )}
      <div className="art-grid">
        {rest.map((a) => (
          <article key={a.id} className="art-card" onClick={() => go("artigo", a.id)}>
            {a.img
              ? <img className="art-img" src={a.img} alt={a.titulo} />
              : <Placeholder label="imagem do artigo" ratio="16/10" />}
            <span className="chapeu">{a.chapeu}</span>
            <h3>{a.titulo}</h3>
            <p>{a.lead}</p>
            <PubMeta pub={a} />
          </article>
        ))}
        <div className="art-card promo">
          <span className="chapeu light">Para empresas</span>
          <h3>Sua marca empregadora numa reportagem do MaringáPost.</h3>
          <p>Empresas parceiras publicam aqui — com a curadoria editorial que dá credibilidade à sua marca.</p>
          <Btn variant="primary" icon="arrow" onClick={() => go("pacotes")}>Conhecer planos</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, VagaScreen, ConteudoScreen });
