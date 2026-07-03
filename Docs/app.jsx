// app.jsx — shell, routing, nav, footer, tweaks
const { useState: useStateA, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#1f8a5b",
  "font": "Newsreader",
  "density": "regular",
  "copyTone": "Editorial"
}/*EDITMODE-END*/;

const ACCENTS = {
  "#1f8a5b": "Verde cidade",
  "#c2410c": "Laranja jornal",
  "#1d4ed8": "Azul cobalto",
  "#7c2d92": "Roxo editorial",
};
const FONTS = {
  "Newsreader": "'Newsreader', Georgia, serif",
  "Spectral": "'Spectral', Georgia, serif",
  "Archivo": "'Archivo', system-ui, sans-serif",
};

// Atalhos no topo (a lista completa também fica no botão Menu à esquerda)
const PRIMARY_NAV = [
  { id: "home", label: "Vagas" },
  { id: "express", label: "Na Hora" },
  { id: "senior", label: "Talento 50+" },
  { id: "inclusao", label: "Inclusão" },
  { id: "desafios", label: "Desafios" },
  { id: "tribuna", label: "Tribuna" },
  { id: "conteudo", label: "Carreira & RH" },
  { id: "pacotes", label: "Para empresas" },
];

// Diretório completo da plataforma (drawer à esquerda)
const MENU_GROUPS = [
  { titulo: "Vagas & Talentos", itens: [
    { id: "home", label: "Vagas", desc: "Todas as vagas verificadas da região", icon: "search" },
    { id: "express", label: "Na Hora", desc: "Vagas com contratação imediata", icon: "bolt" },
    { id: "senior", label: "Talento 50+", desc: "Experiência sênior para projetos e mentorias", icon: "users" },
    { id: "inclusao", label: "Inclusão", desc: "Vagas afirmativas para PCD", icon: "shield" },
    { id: "desafios", label: "Desafios", desc: "Recrutamento por provas práticas", icon: "bolt" },
  ] },
  { titulo: "Conteúdo & Comunidade", itens: [
    { id: "tribuna", label: "Tribuna do Talento", desc: "Conteúdo publicado por profissionais", icon: "chat" },
    { id: "conteudo", label: "Carreira & RH", desc: "Jornalismo e guias de carreira", icon: "doc" },
  ] },
  { titulo: "Para empresas", itens: [
    { id: "pacotes", label: "Planos", desc: "Pacotes para publicar vagas", icon: "layers" },
    { id: "empresa", label: "Publicar vaga", desc: "Área da empresa e painel", icon: "building" },
  ] },
];

function MegaMenu({ open, onClose, go, active, candidatoLogado }) {
  if (!open) return null;
  const nav = (id) => { go(id); onClose(); };
  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Menu da plataforma">
        <div className="mm-head">
          <span className="mm-head-title">Navegar pela plataforma</span>
          <button className="mm-x" onClick={onClose} aria-label="Fechar menu">×</button>
        </div>
        <div className="mm-body">
          {MENU_GROUPS.map((g) => (
            <div key={g.titulo} className="mm-group">
              <h4 className="mm-group-title">{g.titulo}</h4>
              <div className="mm-items">
                {g.itens.map((it) => (
                  <button key={it.id} className={`mm-item ${active === it.id ? "on" : ""}`} onClick={() => nav(it.id)}>
                    <span className="mm-ic"><Icon name={it.icon} size={19} /></span>
                    <span className="mm-txt">
                      <strong>{it.label}</strong>
                      <small>{it.desc}</small>
                    </span>
                    <span className="mm-arrow"><Icon name="arrow" size={16} /></span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mm-foot">
          {candidatoLogado ? (
            <button className="mm-foot-btn" onClick={() => nav("painel-candidato")}><Icon name="users" size={16} /> Minha conta</button>
          ) : (
            <button className="mm-foot-btn prim" onClick={() => nav("cadastro-candidato")}><Icon name="doc" size={16} /> Cadastrar currículo</button>
          )}
          <button className="mm-foot-btn" onClick={() => nav("admin")}><Icon name="shield" size={16} /> Moderação (admin)</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA(parseHash());
  const [saved, setSaved] = useStateA(() => {
    try { return JSON.parse(localStorage.getItem("mp_saved") || "[]"); } catch { return []; }
  });
  const [candidatoLogado, setCandidatoLogado] = useStateA(() => {
    try { return !!localStorage.getItem('mp_candidate'); } catch { return false; }
  });
  const [pubs, setPubs] = useStateA(() => {
    try {
      const s = localStorage.getItem("mp_pubs");
      if (!s) return window.PUBLICACOES;
      const stored = JSON.parse(s);
      // merge: novas publicações do seed que ainda não existem no estado salvo
      const missing = window.PUBLICACOES.filter((p) => !stored.some((x) => x.id === p.id));
      // e atualiza seeds salvos com campos novos (keywords, corpo)
      const merged = stored.map((x) => { const seed = window.PUBLICACOES.find((p) => p.id === x.id); return seed ? { ...seed, ...x, keywords: seed.keywords, corpo: seed.corpo } : x; });
      return [...missing, ...merged];
    } catch { return window.PUBLICACOES; }
  });

  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { localStorage.setItem("mp_saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => { localStorage.setItem("mp_pubs", JSON.stringify(pubs)); }, [pubs]);

  const addPub = (data) => setPubs((p) => [{ id: "pub" + Date.now(), status: "pendente", ...data }, ...p]);
  const approvePub = (id) => setPubs((p) => p.map((x) => x.id === id ? { ...x, status: "aprovada", data: x.data === "Hoje" ? "09 jun 2026" : x.data } : x));
  const rejectPub = (id, motivo) => setPubs((p) => p.map((x) => x.id === id ? { ...x, status: "reprovada", motivo } : x));

  const go = (screen, id) => {
    if (screen === 'painel-candidato') setCandidatoLogado(true);
    location.hash = id ? `${screen}/${id}` : screen;
    window.scrollTo(0, 0);
  };

  const logoutCandidato = () => {
    try { localStorage.removeItem('mp_candidate'); } catch {}
    setCandidatoLogado(false);
    location.hash = 'home';
    window.scrollTo(0, 0);
  };
  const toggleSave = (id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  // apply tweaks to :root
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--accent-glow", t.accent + "1f");
    r.setProperty("--display", FONTS[t.font] || FONTS.Newsreader);
  }, [t.accent, t.font]);

  const { screen, id } = route;
  const showChrome = !["cadastro-candidato", "empresa", "admin"].includes(screen);

  return (
    <div className={`app tone-${t.copyTone}`}>
      {showChrome && <TopNav go={go} active={screen} candidatoLogado={candidatoLogado} logoutCandidato={logoutCandidato} />}
      <main className="main">
        {screen === "home" && <HomeScreen go={go} density={t.density} saved={saved} toggleSave={toggleSave} candidatoLogado={candidatoLogado} />}
        {screen === "express" && <ExpressScreen go={go} />}
        {screen === "senior" && <SeniorScreen go={go} />}
        {screen === "inclusao" && <InclusaoScreen go={go} />}
        {screen === "desafios" && <ChallengeScreen go={go} />}
        {screen === "vaga" && <VagaScreen id={id} go={go} saved={saved} toggleSave={toggleSave} candidatoLogado={candidatoLogado} />}
        {screen === "empresa-perfil" && <EmpresaPerfilScreen key={id} id={id} go={go} saved={saved} toggleSave={toggleSave} />}
        {screen === "conteudo" && <ConteudoScreen go={go} pubs={pubs} />}
        {screen === "tribuna" && <TribunaScreen go={go} candidatoLogado={candidatoLogado} />}
        {screen === "tribuna-post" && <TribunaPostScreen id={id} go={go} candidatoLogado={candidatoLogado} />}
        {screen === "artigo" && <ArtigoScreen id={id} go={go} pubs={pubs} />}
        {screen === "pacotes" && <PacotesScreen go={go} />}
        {screen === "cadastro-candidato" && <CadastroCandidato go={go} />}
        {screen === "painel-candidato" && <PainelCandidato go={go} saved={saved} toggleSave={toggleSave} />}
        {screen === "empresa" && <EmpresaAuth go={go} />}
        {screen === "painel-empresa" && <PainelEmpresa go={go} pubs={pubs} addPub={addPub} />}
        {screen === "admin" && <AdminScreen go={go} pubs={pubs} approvePub={approvePub} rejectPub={rejectPub} />}
      </main>
      {showChrome && <Footer go={go} />}

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakColor label="Cor de destaque" value={t.accent} options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <TweakSelect label="Fonte editorial" value={t.font} options={Object.keys(FONTS)} onChange={(v) => setTweak("font", v)} />
        <TweakSection label="Vagas" />
        <TweakRadio label="Densidade dos cards" value={t.density} options={["compact", "regular"]} onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Conteúdo" />
        <TweakRadio label="Tom da copy" value={t.copyTone} options={["Editorial", "Direto"]} onChange={(v) => setTweak("copyTone", v)} />
      </TweaksPanel>
    </div>
  );
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  if (!h) return { screen: "home", id: null };
  const [screen, id] = h.split("/");
  return { screen, id: id || null };
}

function TopNav({ go, active, candidatoLogado, logoutCandidato }) {
  const [mmOpen, setMmOpen] = useStateA(false);
  const [menuOpen, setMenuOpen] = useStateA(false);
  let perfil = null;
  try { perfil = JSON.parse(localStorage.getItem('mp_candidate') || 'null'); } catch {}
  const nome = perfil?.nome || 'Minha conta';
  const iniciais = nome.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'EU';
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="menu-btn" onClick={() => setMmOpen(true)} aria-label="Abrir menu da plataforma" title="Todos os menus">
          <span className="menu-btn-bars"><span></span><span></span><span></span></span>
        </button>
        <Logo size={20} onClick={() => go("home")} />
        <nav className="nav-links">
          {PRIMARY_NAV.map((n) => (
            <button key={n.id} className={active === n.id ? "on" : ""} onClick={() => go(n.id)}>{n.label}</button>
          ))}
        </nav>
        <div className="nav-cta">
          {candidatoLogado ? (
            <div className="avatar-wrap">
              <button className="avatar-btn" onClick={() => setMenuOpen(o=>!o)} aria-label="Sua conta">
                <span className="avatar-circle">{iniciais}</span>
                <Icon name="chevron" size={15} style={{transform: menuOpen?'rotate(180deg)':'none', transition:'.16s', color:'var(--ink-40)'}} />
              </button>
              {menuOpen && (
                <>
                  <div className="avatar-backdrop" onClick={()=>setMenuOpen(false)} />
                  <div className="avatar-menu">
                    <div className="am-header">
                      <span className="avatar-circle lg">{iniciais}</span>
                      <div className="am-id">
                        <strong>{nome}</strong>
                        <span>Candidato</span>
                      </div>
                    </div>
                    <button className="am-item" onClick={()=>{go('painel-candidato');setMenuOpen(false);}}><Icon name="users" size={16}/> Minha conta</button>
                    <button className="am-item" onClick={()=>{go('cadastro-candidato');setMenuOpen(false);}}><Icon name="doc" size={16}/> Editar cadastro</button>
                    <div className="am-sep" />
                    <button className="am-item am-out" onClick={()=>{logoutCandidato();setMenuOpen(false);}}><Icon name="arrow" size={16} style={{transform:'rotate(180deg)'}}/> Sair</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button className="nav-ghost" onClick={() => go("empresa")}>Sou empresa</button>
              <Btn size="sm" icon="arrow" onClick={() => go("cadastro-candidato")}>Sou candidato</Btn>
            </>
          )}
        </div>
        <button className="burger" onClick={() => setMmOpen(true)} aria-label="Menu">☰</button>
      </div>
      <MegaMenu open={mmOpen} onClose={() => setMmOpen(false)} go={go} active={active} candidatoLogado={candidatoLogado} />
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={18} onClick={() => go("home")} />
          <p>O portal de empregos do MaringáPost. Conectando talentos e empresas no Norte do Paraná com a credibilidade de quem informa a cidade há anos.</p>
          <span className="footer-tag">Independente, sempre.</span>
        </div>
        <div className="footer-cols">
          <div><h4>Candidatos</h4><button onClick={() => go("home")}>Buscar vagas</button><button onClick={() => go("cadastro-candidato")}>Cadastrar currículo</button><button onClick={() => go("painel-candidato")}>Minha conta</button></div>
          <div><h4>Empresas</h4><button onClick={() => go("pacotes")}>Planos</button><button onClick={() => go("empresa")}>Publicar vaga</button><button onClick={() => go("painel-empresa")}>Painel</button></div>
          <div><h4>MaringáPost</h4><button onClick={() => go("conteudo")}>Carreira & RH</button><button onClick={() => go("home")}>Sobre</button><button onClick={() => go("admin")}>Moderação (admin)</button></div>
        </div>
      </div>
      <div className="footer-base">© 2026 MaringáPost Empregos · Maringá, PR · Protótipo</div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
