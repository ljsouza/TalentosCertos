// screens-empresa-perfil.jsx — página institucional pública + painel de configuração
const { useState: useStateEP } = React;

// Extrai o ID de um vídeo do YouTube de várias formas de URL (ou aceita o id puro).
function ytId(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : "";
}

// ---- Configuração da página institucional (persistida em localStorage) ----
const EMPCFG_KEY = "mp_empcfg";
function loadEmpCfgs() { try { return JSON.parse(localStorage.getItem(EMPCFG_KEY) || "{}"); } catch { return {}; } }
function empCfgDefaults(id) {
  const e = window.empById(id) || {};
  return {
    videoAtivo: !!e.videoYoutube,
    videoId: e.videoYoutube || "",
    sobre: e.sobreLongo || e.sobre || "",
    showVagas: true,
    showConteudo: true,
  };
}
function empCfg(id) { return { ...empCfgDefaults(id), ...(loadEmpCfgs()[id] || {}) }; }
function saveEmpCfg(id, cfg) {
  const all = loadEmpCfgs(); all[id] = cfg;
  try { localStorage.setItem(EMPCFG_KEY, JSON.stringify(all)); } catch {}
}

// =================== PÁGINA PÚBLICA ===================
function EmpresaPerfilScreen({ id, go, saved = [], toggleSave }) {
  const e = window.empById(id);
  if (!e) {
    return (
      <div className="screen" style={{ padding: "72px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--ink-60)", marginBottom: 12 }}>Empresa não encontrada.</p>
        <button className="link" onClick={() => go("home")}>Voltar ao início</button>
      </div>
    );
  }
  const cfg = empCfg(id);
  const vagas = window.VAGAS.filter((v) => v.empresa === id);
  const pubs = (window.PUBLICACOES || []).filter((p) => p.empresa === id && p.status === "aprovada");
  const showVideo = cfg.videoAtivo && !!cfg.videoId;

  return (
    <div className="screen emp-perfil">
      <button className="back" onClick={() => go("home")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Voltar</button>

      <header className="emp-hero">
        <CompanyMark empresa={e} size={92} />
        <div className="emp-hero-body">
          <div className="emp-hero-co">
            <h1>{e.nome}</h1>
            {e.verificada && <span className="verif"><Icon name="shield" size={15} /> Verificada</span>}
          </div>
          <p className="emp-hero-setor">{e.setor}</p>
          <div className="emp-hero-meta">
            <span><Icon name="pin" size={15} /> {e.endereco}</span>
            <span><Icon name="users" size={15} /> {e.funcionarios} colaboradores</span>
            <span><Icon name="star" size={15} /> Desde {e.fundada}</span>
            {e.responde && <RespondeBadge tempo={e.tempoResposta} />}
          </div>
        </div>
        <div className="emp-hero-acts">
          <Btn icon="doc" onClick={() => go("home")}>Ver {vagas.length} vaga{vagas.length === 1 ? "" : "s"}</Btn>
          <a className="emp-site" href={`https://${e.site}`} target="_blank" rel="noopener noreferrer"><Icon name="arrow" size={14} /> {e.site}</a>
        </div>
      </header>

      <div className="emp-grid">
        <div className="emp-main">
          {/* Vídeo institucional — só aparece se ativado na configuração */}
          {showVideo && (
            <section className="emp-section">
              <h2>Vídeo institucional</h2>
              <div className="emp-video-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${cfg.videoId}`}
                  title={`Vídeo institucional — ${e.nome}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          )}

          <section className="emp-section">
            <h2>Sobre a {e.nome}</h2>
            <p className="emp-about">{cfg.sobre}</p>
            {e.destaques && (
              <ul className="emp-destaques">
                {e.destaques.map((d, i) => <li key={i}><Icon name="check" size={15} stroke={2.4} /> {d}</li>)}
              </ul>
            )}
          </section>

          {cfg.showVagas && vagas.length > 0 && (
            <section className="emp-section">
              <div className="emp-sec-head"><h2>Vagas abertas</h2></div>
              <div className="job-grid regular">
                {vagas.map((v) => (
                  <JobCard key={v.id} vaga={v} density="compact" onOpen={(vid2) => go("vaga", vid2)} onSave={toggleSave} saved={saved.includes(v.id)} />
                ))}
              </div>
            </section>
          )}

          {cfg.showConteudo && pubs.length > 0 && (
            <section className="emp-section">
              <div className="emp-sec-head"><h2>No MaringáPost</h2></div>
              <div className="emp-pubs">
                {pubs.map((p) => (
                  <button key={p.id} className="emp-pub" onClick={() => go("artigo", p.id)}>
                    <span className="aside-art-chapeu">{p.chapeu}</span>
                    <span className="emp-pub-title">{p.titulo}</span>
                    <span className="aside-art-meta">{p.categoria} · {p.tempo} de leitura</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="emp-aside">
          <div className="emp-facts">
            <h3>Dados da empresa</h3>
            <dl>
              <div><dt>Setor</dt><dd>{e.setor}</dd></div>
              <div><dt>Fundada em</dt><dd>{e.fundada}</dd></div>
              <div><dt>Colaboradores</dt><dd>{e.funcionarios}</dd></div>
              <div><dt>Localização</dt><dd>{e.endereco}</dd></div>
              <div><dt>Tempo de resposta</dt><dd>{e.responde ? e.tempoResposta : "—"}</dd></div>
              <div><dt>Vagas abertas</dt><dd>{e.vagasAbertas}</dd></div>
              <div><dt>Site</dt><dd><a className="link" href={`https://${e.site}`} target="_blank" rel="noopener noreferrer">{e.site}</a></dd></div>
            </dl>
          </div>
          <div className="emp-cta-card">
            <h3>Trabalhe na {e.nome}</h3>
            <p>Receba no WhatsApp as próximas vagas desta empresa assim que forem publicadas.</p>
            <Btn variant="primary" full icon="whatsapp" onClick={() => go("cadastro-candidato")}>Seguir empresa</Btn>
          </div>
        </aside>
      </div>
    </div>
  );
}

// =================== PAINEL: CONFIGURAÇÃO DA PÁGINA ===================
function EmpresaConfigPanel({ go }) {
  const CO = window.CURRENT_CO;
  const e = window.empById(CO) || {};
  const init = empCfg(CO);
  const [videoAtivo, setVideoAtivo] = useStateEP(init.videoAtivo);
  const [videoUrl, setVideoUrl] = useStateEP(init.videoId ? `https://www.youtube.com/watch?v=${init.videoId}` : "");
  const [sobre, setSobre] = useStateEP(init.sobre);
  const [showVagas, setShowVagas] = useStateEP(init.showVagas);
  const [showConteudo, setShowConteudo] = useStateEP(init.showConteudo);
  const [savedFlag, setSavedFlag] = useStateEP(false);

  const parsedId = ytId(videoUrl);
  const save = () => {
    saveEmpCfg(CO, { videoAtivo, videoId: videoAtivo ? parsedId : "", sobre, showVagas, showConteudo });
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 2600);
  };
  const dirtyInvalid = videoAtivo && videoUrl && !parsedId;

  return (
    <div className="emp-cfg">
      <div className="emp-cfg-head">
        <div>
          <span className="chapeu">Divulgação · {e.nome}</span>
          <h2>Página institucional</h2>
          <p>Configure como a sua empresa aparece para candidatos no MaringáPost.</p>
        </div>
        <Btn variant="ghost" icon="arrow" onClick={() => go("empresa-perfil", CO)}>Ver página pública</Btn>
      </div>

      {/* Vídeo */}
      <div className="emp-cfg-card">
        <div className="feat-toggle">
          <div>
            <strong><Icon name="video" size={15} /> Vídeo institucional</strong>
            <span>Exibe um vídeo de apresentação no topo da sua página. Se desativado, a área de vídeo não aparece para o candidato.</span>
          </div>
          <button type="button" className={`switch ${videoAtivo ? "on" : ""}`} onClick={() => setVideoAtivo(!videoAtivo)} role="switch" aria-checked={videoAtivo} aria-label="Ativar vídeo institucional" />
        </div>

        {videoAtivo ? (
          <div className="arf-config">
            <Field label="Link do vídeo no YouTube" required>
              <input value={videoUrl} onChange={(ev) => setVideoUrl(ev.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
            {parsedId ? (
              <div className="emp-cfg-preview">
                <div className="emp-video-frame">
                  <iframe src={`https://www.youtube.com/embed/${parsedId}`} title="Pré-visualização do vídeo institucional"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
                <span className="emp-cfg-ok"><Icon name="check" size={14} stroke={2.4} /> Vídeo reconhecido — é assim que ele aparecerá na página.</span>
              </div>
            ) : videoUrl ? (
              <span className="emp-video-err">Link inválido. Cole o endereço completo do vídeo no YouTube.</span>
            ) : (
              <p className="arf-config-note"><Icon name="play" size={14} /> Publique o vídeo no YouTube e cole o link aqui — ele fica vinculado a esta página.</p>
            )}
          </div>
        ) : (
          <p className="emp-cfg-off"><Icon name="eye" size={14} /> A seção de vídeo está oculta na sua página pública.</p>
        )}
      </div>

      {/* Apresentação */}
      <div className="emp-cfg-card">
        <Field label="Apresentação da empresa">
          <textarea rows="4" value={sobre} onChange={(ev) => setSobre(ev.target.value)} placeholder="Conte, em poucas linhas, quem é a sua empresa…" />
        </Field>
      </div>

      {/* Seções */}
      <div className="emp-cfg-card">
        <span className="field-label" style={{ marginBottom: 4 }}>Seções visíveis na página</span>
        <div className="feat-toggle">
          <div><strong>Vagas abertas</strong><span>Lista automaticamente as vagas ativas da sua empresa.</span></div>
          <button type="button" className={`switch ${showVagas ? "on" : ""}`} onClick={() => setShowVagas(!showVagas)} role="switch" aria-checked={showVagas} aria-label="Mostrar vagas abertas" />
        </div>
        <div className="feat-toggle">
          <div><strong>Conteúdo no MaringáPost</strong><span>Mostra suas reportagens e publicações de Carreira &amp; RH aprovadas.</span></div>
          <button type="button" className={`switch ${showConteudo ? "on" : ""}`} onClick={() => setShowConteudo(!showConteudo)} role="switch" aria-checked={showConteudo} aria-label="Mostrar conteúdo" />
        </div>
      </div>

      <div className="form-actions emp-cfg-actions">
        <Btn type="button" icon="check" onClick={save} >Salvar alterações</Btn>
        {dirtyInvalid && <span className="emp-video-err">Corrija o link do vídeo antes de salvar.</span>}
        {savedFlag && <span className="emp-cfg-saved"><Icon name="check" size={15} stroke={2.4} /> Alterações salvas</span>}
      </div>
    </div>
  );
}

Object.assign(window, { EmpresaPerfilScreen, EmpresaConfigPanel, empCfg, saveEmpCfg, ytId });
