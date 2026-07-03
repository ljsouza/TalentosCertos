// screens-company.jsx — login/cadastro empresa, painel empresa, pacotes
const { useState: useStateE, useEffect: useEffectE } = React;

const diasRestantes = (prazo) => {
  if (!prazo) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(prazo); d.setHours(0,0,0,0);
  return Math.round((d - today) / 86400000);
};

// Candidatos indicados pela IA (com score de intencionalidade)
const CANDS = [
  { n: "Ana M. Silva", c: "Analista de Dados Júnior", m: 92, hab: 95, comp: 90, exp: 88, src: "linkedin", t: "Hoje", dias: 0, resp: { tipo: "em áudio", dur: "0:27" }, intent: { nivel: "alta", label: "Alta intencionalidade", resumo: "Leu as últimas 3 matérias sobre a Apitec e consome conteúdo de tecnologia semanalmente.", sinais: ["Leu as últimas 3 matérias sobre a Apitec no portal", "Consome conteúdo de tecnologia toda semana (12 matérias/mês)", "Visitou esta vaga 3× antes de se candidatar", "Ativou radar de vagas para a sua área há 2 meses"] } },
  { n: "Rafael Costa", c: "Analista de Dados Júnior", m: 84, hab: 88, comp: 80, exp: 80, src: "pdf", t: "Hoje", dias: 0, resp: { tipo: "em áudio", dur: "0:24" }, intent: { nivel: "media", label: "Interesse médio", resumo: "Leu 1 matéria sobre a Apitec; consome conteúdo da área quinzenalmente.", sinais: ["Leu 1 matéria sobre a Apitec nos últimos 30 dias", "Consome conteúdo de tecnologia a cada 15 dias", "Candidatou-se a 4 vagas semelhantes este mês"] } },
  { n: "Juliana Reis", c: "Assistente de Logística", m: 77, hab: 74, comp: 82, exp: 70, src: "linkedin", t: "Ontem", dias: 1, intent: { nivel: "alta", label: "Alta intencionalidade", resumo: "Acompanha suas vagas há 2 meses e lê logística toda semana.", sinais: ["Salvou 2 vagas da sua empresa antes de se candidatar", "Lê conteúdo de logística toda semana (9 matérias/mês)", "Acompanha suas publicações de Carreira & RH há 2 meses"] } },
  { n: "Pedro Alves", c: "Analista de Dados Júnior", m: 69, hab: 70, comp: 66, exp: 68, src: "pdf", t: "2 dias", dias: 2, intent: { nivel: "explor", label: "Exploratório", resumo: "Primeira interação com sua empresa; candidaturas amplas em várias áreas.", sinais: ["Primeira interação com conteúdo da sua empresa", "Candidatou-se a 12 vagas em áreas diversas nos últimos 30 dias"] } },
];
const INTENT_RANK = { alta: 3, media: 2, explor: 1 };

// Pool de nomes para gerar candidaturas por vaga (determinístico e estável)
const NOME_POOL = ["Ana M. Silva", "Rafael Costa", "Juliana Reis", "Pedro Alves", "Camila Duarte", "Bruno Tavares", "Larissa Nunes", "Diego Moraes", "Patrícia Lima", "Marcos Aurélio"];
const QUANDO = ["Hoje", "Hoje", "Ontem", "2 dias", "3 dias", "4 dias"];
function candidatosDaVaga(v) {
  if (!v) return [];
  const seed = parseInt(String(v.id).replace(/\D/g, ""), 10) || 1;
  const count = Math.min(6, Math.max(3, Math.round(v.candidatos / 9)));
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: v.id + "-c" + i,
      nome: NOME_POOL[(seed + i) % NOME_POOL.length],
      match: Math.max(48, v.match - i * 7 - ((seed + i) % 3) * 2),
      src: (seed + i) % 2 ? "linkedin" : "pdf",
      quando: QUANDO[i] || "5 dias",
      fone: "(44) 9 9•••-••" + String(10 + ((seed * 7 + i * 13) % 89)).padStart(2, "0"),
    });
  }
  return out;
}

// Mensagem automática de retorno (WhatsApp) para não selecionados
const WA_TPL_KEY = "mp_wa_tpl";
const WA_TPL_DEFAULT = "Olá, {nome}! Aqui é do RH da {empresa}.\n\nAgradecemos muito a sua inscrição na vaga de {vaga}. Neste momento, você não foi selecionado(a) para as próximas etapas do processo seletivo.\n\nSeu currículo permanece em nosso banco de talentos para futuras oportunidades. Desejamos muito sucesso na sua jornada!";
function loadWaTpl() { try { return localStorage.getItem(WA_TPL_KEY) || WA_TPL_DEFAULT; } catch { return WA_TPL_DEFAULT; } }
function renderWa(tpl, c, vaga) {
  const emp = (window.empById(vaga.empresa) || {}).nome || "nossa empresa";
  return tpl.replace(/\{nome\}/g, c.nome.split(" ")[0]).replace(/\{vaga\}/g, vaga.titulo).replace(/\{empresa\}/g, emp);
}

function EmpresaAuth({ go }) {
  const [mode, setMode] = useStateE("login");
  return (
    <div className="screen auth">
      <div className="auth-split">
        <div className="auth-aside co">
          <Logo size={20} onClick={() => go("home")} />
          <div className="auth-aside-body">
            <span className="chapeu light">Área da empresa</span>
            <h2>Contrate melhor com a credibilidade do MaringáPost.</h2>
            <ul className="auth-points">
              <li><Icon name="check" size={16} stroke={2.4} /> Anúncios verificados e bem posicionados</li>
              <li><Icon name="check" size={16} stroke={2.4} /> Selo "Empresa que responde"</li>
              <li><Icon name="check" size={16} stroke={2.4} /> Marca empregadora em reportagens</li>
            </ul>
            <div className="auth-logos">
              {window.EMPRESAS.slice(0, 4).map((e) => <CompanyMark key={e.id} empresa={e} size={38} />)}
              <span>+308 empresas</span>
            </div>
          </div>
          <span className="auth-foot">Independente, sempre.</span>
        </div>

        <div className="auth-form">
          <div className="auth-toggle">
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Entrar</button>
            <button className={mode === "signup" ? "on" : ""} onClick={() => setMode("signup")}>Criar conta</button>
          </div>

          {mode === "login" ? (
            <form className="form" onSubmit={(e) => { e.preventDefault(); go("painel-empresa"); }}>
              <h1>Acesse seu painel</h1>
              <Field label="E-mail corporativo" required><input type="email" required placeholder="rh@suaempresa.com.br" /></Field>
              <Field label="Senha" required><input type="password" required placeholder="••••••••" /></Field>
              <button type="button" className="link forgot">Esqueci minha senha</button>
              <Btn full type="submit" icon="arrow">Entrar</Btn>
            </form>
          ) : (
            <form className="form" onSubmit={(e) => { e.preventDefault(); go("painel-empresa"); }}>
              <h1>Crie a conta da empresa</h1>
              <p className="form-sub">Comece grátis. Escolha um plano quando publicar.</p>
              <div className="grid-2">
                <Field label="Razão social" required><input required placeholder="Sua Empresa Ltda" /></Field>
                <Field label="CNPJ" required><input required placeholder="00.000.000/0001-00" /></Field>
                <Field label="Responsável" required><input required placeholder="Nome do contato" /></Field>
                <Field label="Telefone" required><input required placeholder="(44) 3000-0000" /></Field>
              </div>
              <Field label="E-mail corporativo" required><input type="email" required placeholder="rh@suaempresa.com.br" /></Field>
              <Btn full type="submit" icon="arrow">Criar conta e continuar</Btn>
              <p className="form-foot">Ao continuar você aceita os termos do portal.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PainelEmpresa({ go, pubs, addPub }) {
  const { VAGAS } = window;
  const minhas = VAGAS.filter((v) => ["e1", "e2"].includes(v.empresa)).slice(0, 4);
  const [tab, setTab] = useStateE("vagas");
  const [sinaisDe, setSinaisDe] = useStateE(null);
  const [arfOn, setArfOn] = useStateE(true);
  const [arfFormato, setArfFormato] = useStateE("audio");
  const [modalidade, setModalidade] = useStateE("presencial");
  // IA — geração de vaga
  const [iaVaga, setIaVaga] = useStateE(null);
  const [vTitulo, setVTitulo] = useStateE("");
  const [vSalario, setVSalario] = useStateE("");
  const [vArea, setVArea] = useStateE("");
  const [vDesc, setVDesc] = useStateE("");
  const [vReq, setVReq] = useStateE([]);
  const [vTriagem, setVTriagem] = useStateE([]);
  const [vAnuncio, setVAnuncio] = useStateE("");
  const aplicarIA = (g) => {
    setIaVaga(g); setVTitulo(g.titulo); setVSalario(g.salario); setVDesc(g.descricao); setVArea(g.area);
    setVReq(g.requisitos); setVTriagem(g.triagem); setVAnuncio(g.anuncio); setModalidade(g.modalidade);
    if (g.arfQuestion) setArfOn(true);
  };
  // filtros da aba candidatos
  const [cIntent, setCIntent] = useStateE("todas");
  const [cMatchMin, setCMatchMin] = useStateE(0);
  const [cFonte, setCFonte] = useStateE("todas");
  const [cResp, setCResp] = useStateE(false);
  const [cSort, setCSort] = useStateE("match");
  // status das vagas e seleção de candidatos por vaga
  const [verVaga, setVerVaga] = useStateE(null);
  const [vagaStatus, setVagaStatus] = useStateE({});
  const [selecao, setSelecao] = useStateE({});
  const [vagaFiltro, setVagaFiltro] = useStateE("todas");
  const [confirmCancel, setConfirmCancel] = useStateE(null);
  const [cancelMotivo, setCancelMotivo] = useStateE("");
  const [autoFechadasAlerta, setAutoFechadasAlerta] = useStateE([]);
  const [prazoForm, setPrazoForm] = useStateE("");

  useEffectE(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const expiradas = minhas.filter(v => {
      if (!v.prazo) return false;
      const d = new Date(v.prazo); d.setHours(0,0,0,0);
      return d < today;
    });
    if (expiradas.length) {
      const ids = expiradas.map(v => v.id);
      setVagaStatus(s => { const n = {...s}; ids.forEach(id => { if (!n[id]) n[id] = 'encerrada'; }); return n; });
      setAutoFechadasAlerta(ids);
    }
  }, []);

  return (
    <div className="screen panel">
      <div className="panel-head">
        <div>
          <span className="chapeu">Painel da empresa · Apitec Engenharia</span>
          <h1>Bem-vindo de volta</h1>
        </div>
        <div className="panel-actions">
          <span className="plan-badge"><Icon name="star" size={14} stroke={2} /> Plano Profissional</span>
          <Btn icon="plus" onClick={() => setTab("nova")}>Publicar vaga</Btn>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi n="6" l="Vagas ativas" icon="doc" />
        <Kpi n="148" l="Candidatos no mês" icon="users" />
        <Kpi n="2.140" l="Visualizações" icon="eye" />
        <Kpi n="2 dias" l="Seu tempo de resposta" icon="clock" />
      </div>

      <div className="panel-tabs">
        <button className={tab === "vagas" ? "on" : ""} onClick={() => setTab("vagas")}>Minhas vagas</button>
        <button className={tab === "alcance" ? "on" : ""} onClick={() => setTab("alcance")}>Alcance</button>
        <button className={tab === "candidatos" ? "on" : ""} onClick={() => setTab("candidatos")}>Candidatos</button>
        <button className={tab === "talentos" ? "on" : ""} onClick={() => setTab("talentos")}>Radar de talentos <span className="tab-new">novo</span></button>
        <button className={tab === "perfil" ? "on" : ""} onClick={() => setTab("perfil")}>Página institucional</button>
        <button className={tab === "conteudo" ? "on" : ""} onClick={() => setTab("conteudo")}>Carreira & RH</button>
        <button className={tab === "nova" ? "on" : ""} onClick={() => setTab("nova")}>Publicar vaga</button>
      </div>

      {tab === "vagas" && !verVaga && (() => {
        const isCancelada = (v) => vagaStatus[v.id] === "cancelada";
        const isEncerrada = (v) => vagaStatus[v.id] === "encerrada";
        const isAtiva     = (v) => !isCancelada(v) && !isEncerrada(v);
        const nAbertas    = minhas.filter(isAtiva).length;
        const nEncerradas = minhas.filter(isEncerrada).length;
        const nCanceladas = minhas.filter(isCancelada).length;
        const visiveis    = minhas.filter((v) =>
          vagaFiltro === "todas"     ? true :
          vagaFiltro === "aberta"    ? isAtiva(v) :
          vagaFiltro === "encerrada" ? isEncerrada(v) :
          vagaFiltro === "cancelada" ? isCancelada(v) : true
        );
        const cancelar = (id) => { setVagaStatus(s=>({...s,[id]:'cancelada'})); setConfirmCancel(null); setCancelMotivo(""); };
        return (
          <div>
            {confirmCancel && (
              <div className="adm-modal-bg" onClick={()=>{setConfirmCancel(null);setCancelMotivo("");}}>
                <div className="adm-modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
                  <h3>Cancelar vaga</h3>
                  <p style={{fontSize:14,color:'var(--ink-60)',margin:'8px 0 16px',lineHeight:1.5}}>Tem certeza que deseja cancelar <strong>{window.vagaById(confirmCancel)?.titulo}</strong>? Ela será removida da vitrine imediatamente.</p>
                  <div className="field" style={{marginBottom:20}}>
                    <label className="field-label">Motivo do cancelamento *</label>
                    <select style={{padding:'9px 12px',border:'1px solid var(--line)',borderRadius:8,fontSize:14,outline:'none',width:'100%',marginTop:6}} value={cancelMotivo} onChange={e=>setCancelMotivo(e.target.value)}>
                      <option value="">Selecione um motivo</option>
                      <option value="Vaga Cancelada">Vaga Cancelada</option>
                      <option value="Fechada em Outro Canal">Fechada em Outro Canal</option>
                      <option value="Falta de Candidatos Aptos">Falta de Candidatos Aptos</option>
                    </select>
                  </div>
                  <div className="adm-modal-acts">
                    <Btn variant="ghost" onClick={()=>{setConfirmCancel(null);setCancelMotivo("");}}>Voltar</Btn>
                    <button className="btn btn-bad" disabled={!cancelMotivo} style={{opacity:cancelMotivo?1:.45,cursor:cancelMotivo?'pointer':'not-allowed'}} onClick={()=>cancelar(confirmCancel)}>Sim, cancelar vaga</button>
                  </div>
                </div>
              </div>
            )}
            {autoFechadasAlerta.length > 0 && (
              <div className="alerta-venc">
                <div className="av-icon"><Icon name="clock" size={22} /></div>
                <div className="av-body">
                  <strong>Vagas encerradas automaticamente</strong>
                  <p>O prazo de divulgação expirou. Acesse cada vaga para selecionar os candidatos e enviar o retorno:</p>
                  <div className="av-vagas">
                    {autoFechadasAlerta.map(id => {
                      const vv = window.vagaById(id);
                      if (!vv) return null;
                      return (
                        <button key={id} className="av-item" onClick={() => setVerVaga(id)}>
                          <Icon name="users" size={14} /> {vv.titulo}
                          <span>Selecionar candidatos →</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button className="av-close" onClick={() => setAutoFechadasAlerta([])} aria-label="Fechar">
                  <Icon name="plus" size={16} stroke={2.4} style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
            )}
            <div className="vag-toolbar">
              <span className="cf-label">Status</span>
              <div className="cf-pills">
                {[["todas","Todas",minhas.length],["aberta","Abertas",nAbertas],["encerrada","Encerradas",nEncerradas],["cancelada","Canceladas",nCanceladas]].map(([k,l,n])=>(
                  <button key={k} className={`cf-pill ${vagaFiltro===k?"on":""}`} onClick={()=>setVagaFiltro(k)}>{l} <span className="cf-n">{n}</span></button>
                ))}
              </div>
            </div>
            <div className="vag-table">
              <div className="vt-head"><span>Vaga</span><span>Candidatos</span><span>Status</span><span>Prazo</span><span>Desempenho</span><span></span></div>
              {visiveis.length === 0 ? (
                <div className="vag-empty">Nenhuma vaga no momento.</div>
              ) : visiveis.map((v) => {
                const cancelada = isCancelada(v);
                const encerrada = isEncerrada(v);
                const ativa     = isAtiva(v);
                return (
                  <div key={v.id} className={`vt-row ${cancelada?'vt-row-canceled':''}`}>
                    <div className="vt-title"><strong>{v.titulo}{v.destaque && <span className="vt-feat-tag"><Icon name="star" size={11} stroke={2} /> Destaque</span>}</strong><span>{v.area} · {v.cidade}</span></div>
                    <span className="vt-cand"><Icon name="users" size={15} /> {v.candidatos}</span>
                    <span className={`vt-st ${cancelada?'canceled':encerrada?'closed':'open'}`}>{cancelada?'Cancelada':encerrada?'Encerrada':'Aberta'}</span>
                    <span>{(() => {
                      const d = diasRestantes(v.prazo);
                      const dataFmt = v.prazo ? new Date(v.prazo + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
                      const badge = (() => {
                        if (d === null) return <span className="prazo-badge prazo-expired">—</span>;
                        if (d < 0) return <span className="prazo-badge prazo-expired">Vencida</span>;
                        if (d === 0) return <span className="prazo-badge prazo-urgent">Encerra hoje</span>;
                        if (d <= 3) return <span className="prazo-badge prazo-warn">{d}d restantes</span>;
                        return <span className="prazo-badge prazo-ok">{d}d restantes</span>;
                      })();
                      return <span style={{display:'flex',flexDirection:'column',gap:3}}>{badge}{dataFmt && <span style={{fontSize:11,color:'var(--ink-40)',fontWeight:600,paddingLeft:2}}>{dataFmt}</span>}</span>;
                    })()}</span>
                    <div className="vt-bar"><span style={{ width: `${v.match}%` }} /></div>
                    <div className="vt-actions">
                      {!cancelada && <button className="btn btn-sm btn-ghost vt-btn-cand" onClick={()=>setVerVaga(v.id)}><Icon name="users" size={13}/> Ver candidatos</button>}
                      {ativa && <button className="btn btn-sm vt-btn-cancel" onClick={()=>setConfirmCancel(v.id)}><Icon name="plus" size={12} stroke={2.4} style={{transform:'rotate(45deg)'}}/> Cancelar vaga</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {tab === "vagas" && verVaga && (
        <VagaCandidatosView
          vaga={window.vagaById(verVaga)}
          encerrada={vagaStatus[verVaga] === "encerrada"}
          onToggleStatus={() => setVagaStatus((s) => ({ ...s, [verVaga]: s[verVaga] === "encerrada" ? "aberta" : "encerrada" }))}
          selecao={selecao}
          setSelecao={setSelecao}
          onBack={() => setVerVaga(null)}
        />
      )}

      {tab === "alcance" && <AlcancePanel />}

      {tab === "talentos" && <TalentRadar />}

      {tab === "perfil" && <EmpresaConfigPanel go={go} />}

      {tab === "candidatos" && (() => {
        const counts = { alta: 0, media: 0, explor: 0 };
        CANDS.forEach((c) => { counts[c.intent.nivel]++; });
        let lista = CANDS.filter((c) => {
          if (cIntent !== "todas" && c.intent.nivel !== cIntent) return false;
          if (c.m < cMatchMin) return false;
          if (cFonte !== "todas" && c.src !== cFonte) return false;
          if (cResp && !c.resp) return false;
          return true;
        }).slice().sort((a, b) => {
          if (cSort === "intent") return INTENT_RANK[b.intent.nivel] - INTENT_RANK[a.intent.nivel] || b.m - a.m;
          if (cSort === "recente") return a.dias - b.dias || b.m - a.m;
          return b.m - a.m;
        });
        const ativos = Number(cIntent !== "todas") + Number(cMatchMin > 0) + Number(cFonte !== "todas") + Number(cResp);
        const limpar = () => { setCIntent("todas"); setCMatchMin(0); setCFonte("todas"); setCResp(false); };
        const pct = cMatchMin / 95 * 100;
        return (
        <div className="cand-list">
          <div className="ai-rank-banner">
            <span className="ai-badge"><Icon name="bolt" size={14} /> Indicados pela IA</span>
            <p>Candidatos ordenados pela IA do MaringáPost, cruzando <strong>habilidades técnicas</strong>, <strong>perfil comportamental</strong>, <strong>experiência</strong> — e agora o <strong>score de intencionalidade</strong>: o interesse real demonstrado pela leitura no portal.</p>
          </div>

          <div className="cand-toolbar">
            <div className="cand-toolbar-top">
              <span className="cand-count"><b>{lista.length}</b> de {CANDS.length} candidatos</span>
              <div className="cand-sort">
                <span>Ordenar por</span>
                {[["match", "Match"], ["intent", "Intencionalidade"], ["recente", "Mais recentes"]].map(([k, l]) => (
                  <button key={k} className={cSort === k ? "on" : ""} onClick={() => setCSort(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="cand-filter-grid">
              <div className="cf-group cf-grow">
                <span className="cf-label">% de match mínimo</span>
                <div className="cf-slider">
                  <div className="cf-slider-val">
                    {cMatchMin === 0 ? <span className="any">Qualquer compatibilidade</span> : <>{cMatchMin}%<span> ou mais</span></>}
                  </div>
                  <input type="range" className="cf-range" min="0" max="95" step="5" value={cMatchMin}
                    onChange={(e) => setCMatchMin(+e.target.value)} aria-label="Match mínimo"
                    style={{ background: `linear-gradient(to right, var(--accent) ${pct}%, var(--line-2) ${pct}%)` }} />
                </div>
              </div>
              <div className="cf-group">
                <span className="cf-label">Grau de intencionalidade</span>
                <div className="cf-pills">
                  <button className={`cf-pill ${cIntent === "todas" ? "on" : ""}`} onClick={() => setCIntent("todas")}>Todas <span className="cf-n">{CANDS.length}</span></button>
                  {[["alta", "Alta"], ["media", "Média"], ["explor", "Exploratório"]].map(([k, l]) => (
                    <button key={k} className={`cf-pill ${k} ${cIntent === k ? "on" : ""}`} onClick={() => setCIntent(cIntent === k ? "todas" : k)}>
                      <Icon name="bolt" size={12} stroke={2.2} /> {l} <span className="cf-n">{counts[k]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="cf-group">
                <span className="cf-label">Origem & resposta</span>
                <div className="cf-pills">
                  {[["todas", "Todas as origens"], ["linkedin", "LinkedIn"], ["pdf", "Currículo PDF"]].map(([k, l]) => (
                    <button key={k} className={`cf-pill ${cFonte === k ? "on" : ""}`} onClick={() => setCFonte(k)}>{l}</button>
                  ))}
                  <button className={`cf-pill ${cResp ? "on" : ""}`} onClick={() => setCResp(!cResp)}><Icon name="play" size={11} /> Com resposta ativa</button>
                </div>
              </div>
            </div>
            {ativos > 0 && <button className="cf-clear link" onClick={limpar}><Icon name="arrow" size={13} stroke={2.2} style={{ transform: "rotate(180deg)" }} /> Limpar filtros ({ativos})</button>}
          </div>

          {lista.length === 0 ? (
            <div className="cand-empty">
              <div className="cand-empty-ic"><Icon name="users" size={22} /></div>
              <strong>Nenhum candidato com esses filtros</strong>
              <p>Reduza o match mínimo ou amplie o grau de intencionalidade para ver mais candidatos.</p>
              <button className="link" onClick={limpar}>Limpar todos os filtros</button>
            </div>
          ) : lista.map((c) => (
            <div key={c.n} className="cand-card">
              <div className="cand-av">{c.n.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              <div className="cand-info">
                <div className="cand-name-row"><strong>{c.n}</strong><span className={`intent-badge ${c.intent.nivel}`}><Icon name="bolt" size={12} stroke={2.2} /> {c.intent.label}</span></div>
                <span>{c.c} · candidatou {c.t.toLowerCase()}</span>
                <div className="cand-bd">
                  {[["Técnico", c.hab], ["Comportamental", c.comp], ["Experiência", c.exp]].map(([l, v]) => (
                    <div key={l} className="bd-item" title={`${l}: ${v}%`}>
                      <span>{l}</span>
                      <div className="bd-bar"><span style={{ width: `${v}%` }} /></div>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
                <div className="intent-block">
                  <p className="intent-resumo">{c.intent.resumo}</p>
                  <button className="intent-toggle" onClick={() => setSinaisDe(sinaisDe === c.n ? null : c.n)}>{sinaisDe === c.n ? "Ocultar sinais" : `Ver sinais de interesse (${c.intent.sinais.length})`}</button>
                  {sinaisDe === c.n && (
                    <ul className="intent-signals">
                      {c.intent.sinais.map((s, j) => <li key={j}><Icon name="check" size={14} stroke={2.4} /> {s}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              <div className="cand-match" title="Compatibilidade geral calculada pela IA">
                <MatchRing value={c.m} size={46} />
                <span>match<br />por IA</span>
              </div>
              <div className="cand-acts">
                <span className={`src-tag ${c.src}`}>{c.src === "linkedin" ? "via LinkedIn" : "Currículo PDF"}</span>
                {c.resp && <span className="resp-chip" title="Resposta ao filtro de resposta ativa"><Icon name="play" size={12} /> Resposta {c.resp.tipo} · {c.resp.dur}</span>}
                <Btn size="sm" variant="ghost" icon="doc">Currículo</Btn>
                <Btn size="sm" icon="check">Avançar</Btn>
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      {tab === "conteudo" && <CompanyContentPanel pubs={pubs} addPub={addPub} />}

      {tab === "nova" && (
        <form className="form nova-vaga" onSubmit={(e) => { e.preventDefault(); setTab("vagas"); }}>
          <IAVagaBox onGerar={(g) => aplicarIA(g)} />
          {iaVaga && (
            <div className="iav-result-flag"><Icon name="check" size={15} stroke={2.4} /> Vaga gerada pela IA · revise e ajuste os campos abaixo antes de publicar</div>
          )}
          <div className="grid-2">
            <Field label="Título da vaga" required><input required value={vTitulo} onChange={(e) => setVTitulo(e.target.value)} placeholder="Ex: Analista de Marketing" /></Field>
            <Field label="Área"><select value={vArea} onChange={(e) => setVArea(e.target.value)}><option value="">Selecione...</option>{window.AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
            <Field label="Cidade"><select>{window.CIDADES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Faixa salarial"><input value={vSalario} onChange={(e) => setVSalario(e.target.value)} placeholder="R$ 2.000 – R$ 3.000" /></Field>
            <Field label="Prazo de divulgação" required>
              <input type="date" required min={new Date().toISOString().split('T')[0]} value={prazoForm} onChange={(e) => setPrazoForm(e.target.value)} />
            </Field>
          </div>
          <div className="mod-field">
            <span className="field-label">Modalidade de trabalho</span>
            <div className="arf-format-opts">
              {[["presencial","building","Presencial"],["hibrido","layers","Híbrido"],["remoto","globe","Remoto"]].map(([k,ic,l]) => (
                <button type="button" key={k} className={`arf-fmt mod-opt-${k} ${modalidade===k?"on":""}`} onClick={() => setModalidade(k)}>
                  <Icon name={ic} size={15}/> {l}
                </button>
              ))}
            </div>
          </div>
          <Field label="Descrição da vaga" required>
            <textarea rows="4" required value={vDesc} onChange={(e) => setVDesc(e.target.value)} placeholder="Descreva responsabilidades, requisitos e benefícios..." />
          </Field>

          {iaVaga && (
            <>
              <div className="iav-section">
                <div className="iav-section-head"><span className="field-label">Requisitos</span><span className="iav-tag"><Icon name="bolt" size={12} /> sugerido pela IA</span></div>
                <div className="iav-list">
                  {vReq.map((r, i) => (
                    <div key={i} className="iav-list-row">
                      <Icon name="check" size={14} stroke={2.4} />
                      <input value={r} onChange={(e) => setVReq(vReq.map((x, j) => j === i ? e.target.value : x))} />
                      <button type="button" className="iav-del" onClick={() => setVReq(vReq.filter((_, j) => j !== i))} aria-label="Remover"><Icon name="plus" size={14} stroke={2.2} style={{ transform: "rotate(45deg)" }} /></button>
                    </div>
                  ))}
                  <button type="button" className="iav-add" onClick={() => setVReq([...vReq, ""])}><Icon name="plus" size={13} stroke={2.2} /> Adicionar requisito</button>
                </div>
              </div>

              <div className="iav-section">
                <div className="iav-section-head"><span className="field-label">Perguntas de triagem</span><span className="iav-tag"><Icon name="bolt" size={12} /> sugerido pela IA</span></div>
                <div className="iav-list">
                  {vTriagem.map((q, i) => (
                    <div key={i} className="iav-list-row">
                      <span className="iav-qn">{i + 1}</span>
                      <input value={q} onChange={(e) => setVTriagem(vTriagem.map((x, j) => j === i ? e.target.value : x))} />
                      <button type="button" className="iav-del" onClick={() => setVTriagem(vTriagem.filter((_, j) => j !== i))} aria-label="Remover"><Icon name="plus" size={14} stroke={2.2} style={{ transform: "rotate(45deg)" }} /></button>
                    </div>
                  ))}
                  <button type="button" className="iav-add" onClick={() => setVTriagem([...vTriagem, ""])}><Icon name="plus" size={13} stroke={2.2} /> Adicionar pergunta</button>
                </div>
              </div>

              <div className="iav-section">
                <div className="iav-section-head"><span className="field-label">Anúncio otimizado</span><span className="iav-tag"><Icon name="bolt" size={12} /> pronto para publicar</span></div>
                <div className="iav-anuncio">
                  <textarea rows="12" value={vAnuncio} onChange={(e) => setVAnuncio(e.target.value)} />
                  <button type="button" className="iav-copy" onClick={() => { navigator.clipboard?.writeText(vAnuncio); }}><Icon name="doc" size={14} /> Copiar anúncio</button>
                </div>
              </div>
            </>
          )}
          <div className="feat-toggle">
            <div><strong>Destacar no topo das buscas</strong><span>Disponível no seu plano · até 4 destaques simultâneos</span></div>
            <span className="switch on" />
          </div>
          <div className="feat-toggle arf-param">
            <div>
              <strong><Icon name="mic" size={15} /> Filtro de Resposta Ativa</strong>
              <span>O candidato só conclui a inscrição após responder 1 pergunta em áudio ou vídeo de 30s. Filtra candidaturas em massa e entrega só quem tem interesse real.</span>
            </div>
            <button type="button" className={`switch ${arfOn ? "on" : ""}`} onClick={() => setArfOn(!arfOn)} role="switch" aria-checked={arfOn} aria-label="Ativar filtro de resposta ativa" />
          </div>
          {arfOn && (
            <div className="arf-config">
              <Field label="Pergunta de 30 segundos" required>
                <input required placeholder="Ex: Por que você quer trabalhar com a gente?" defaultValue="Em 30 segundos: qual análise de dados que você fez gerou mais impacto — e por quê?" />
              </Field>
              <div className="arf-formats">
                <span className="field-label">Formato da resposta</span>
                <div className="arf-format-opts">
                  {[["audio", "mic", "Áudio"], ["video", "video", "Vídeo"], ["livre", "bolt", "Candidato escolhe"]].map(([k, ic, l]) => (
                    <button type="button" key={k} className={`arf-fmt ${arfFormato === k ? "on" : ""}`} onClick={() => setArfFormato(k)}><Icon name={ic} size={15} /> {l}</button>
                  ))}
                </div>
              </div>
              <p className="arf-config-note"><Icon name="chart" size={14} /> Vagas com resposta ativa recebem em média <strong>78% menos candidaturas vazias</strong> e o dobro de taxa de avanço por candidato.</p>
            </div>
          )}
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setTab("vagas")}>Cancelar</Btn>
            <Btn type="submit" icon="check">Publicar vaga</Btn>
          </div>
        </form>
      )}
    </div>
  );
}

function VagaCandidatosView({ vaga, encerrada, onToggleStatus, selecao, setSelecao, onBack }) {
  const lista = candidatosDaVaga(vaga);
  const [checked, setChecked] = useStateE([]);
  const [toast, setToast] = useStateE(null);
  const [preview, setPreview] = useStateE(null);
  const [tpl, setTpl] = useStateE(loadWaTpl());
  const [draftTpl, setDraftTpl] = useStateE("");
  const [editTpl, setEditTpl] = useStateE(false);
  if (!vaga) return null;
  const empresa = window.empById(vaga.empresa) || {};
  const key = (id) => `${vaga.id}|${id}`;
  const stOf = (id) => selecao[key(id)] || "analise";
  const nSel = lista.filter((c) => stOf(c.id) === "sel").length;
  const nNao = lista.filter((c) => stOf(c.id) === "nao").length;
  const nAna = lista.length - nSel - nNao;

  const notifyWa = (cands) => {
    if (!cands.length) return;
    setToast(cands.length === 1
      ? `Mensagem de retorno enviada no WhatsApp de ${cands[0].nome}`
      : `Mensagem de retorno enviada a ${cands.length} candidatos no WhatsApp`);
    clearTimeout(window.__waToast); window.__waToast = setTimeout(() => setToast(null), 3400);
  };

  const allChecked = lista.length > 0 && checked.length === lista.length;
  const toggleAll = () => setChecked(allChecked ? [] : lista.map((c) => c.id));
  const toggleOne = (id) => setChecked((ch) => ch.includes(id) ? ch.filter((x) => x !== id) : [...ch, id]);
  const aplicar = (val) => {
    setSelecao((prev) => { const n = { ...prev }; checked.forEach((id) => { n[key(id)] = val; }); return n; });
    if (val === "nao") notifyWa(lista.filter((c) => checked.includes(c.id)));
    setChecked([]);
  };
  // Aplica seleção final: marcados = selecionados, TODOS os demais = não selecionados
  const aplicarSelecaoFinal = () => {
    const recusados = lista.filter((c) => !checked.includes(c.id) && stOf(c.id) !== "nao");
    setSelecao((prev) => {
      const n = { ...prev };
      lista.forEach((c) => { n[key(c.id)] = checked.includes(c.id) ? "sel" : "nao"; });
      return n;
    });
    notifyWa(recusados);
    setChecked([]);
  };
  // Recusa todos que seguem "em análise" (após já ter selecionado pelo botão da linha)
  const recusarRestantes = () => {
    const restantes = lista.filter((c) => stOf(c.id) === "analise");
    if (!restantes.length) return;
    setSelecao((prev) => { const n = { ...prev }; restantes.forEach((c) => { n[key(c.id)] = "nao"; }); return n; });
    notifyWa(restantes);
  };
  const setOne = (id, val) => {
    const next = selecao[key(id)] === val ? undefined : val;
    setSelecao((prev) => ({ ...prev, [key(id)]: next }));
    if (next === "nao") notifyWa([lista.find((c) => c.id === id)]);
  };
  const encerrar = () => {
    const novos = lista.filter((c) => !selecao[key(c.id)]);
    setSelecao((prev) => { const n = { ...prev }; lista.forEach((c) => { if (!n[key(c.id)]) n[key(c.id)] = "nao"; }); return n; });
    notifyWa(novos);
    onToggleStatus();
  };
  const saveTpl = () => { setTpl(draftTpl); try { localStorage.setItem(WA_TPL_KEY, draftTpl); } catch {} setEditTpl(false); };
  const stLabel = { sel: "Selecionado", nao: "Não selecionado", analise: "Em análise" };
  const empInit = empresa.nome ? empresa.nome.split(" ").map((w) => w[0]).slice(0, 2).join("") : "";

  return (
    <div className="vc">
      <button className="back" onClick={onBack}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Voltar às vagas</button>
      <div className="vc-head">
        <div className="vc-head-info">
          <span className="chapeu">Candidatos da vaga</span>
          <h2>{vaga.titulo}</h2>
          <div className="vc-head-meta">
            <span className={`vt-st ${encerrada ? "closed" : "open"}`}>{encerrada ? "Encerrada" : "Aberta"}</span>
            <span>{vaga.area} · {vaga.cidade}</span>
            <span><Icon name="users" size={14} /> {vaga.candidatos} candidaturas</span>
          </div>
        </div>
        <div className="vc-head-acts">
          {encerrada
            ? <Btn variant="ghost" icon="arrow" onClick={onToggleStatus}>Reabrir vaga</Btn>
            : <Btn variant="ghost" onClick={encerrar}>Encerrar vaga</Btn>}
        </div>
      </div>

      <div className="vc-summary">
        <span className="vc-sum sel"><b>{nSel}</b> selecionados</span>
        <span className="vc-sum nao"><b>{nNao}</b> não selecionados</span>
        <span className="vc-sum analise"><b>{nAna}</b> em análise</span>
      </div>

      <p className="vc-wa-note"><Icon name="whatsapp" size={14} /> Ao marcar um candidato como <strong>não selecionado</strong>, o MaringáPost dispara automaticamente uma mensagem de agradecimento no WhatsApp dele. <button className="link" onClick={() => { setDraftTpl(tpl); setPreview(lista[0]); setEditTpl(true); }}>Editar mensagem padrão</button></p>

      {nSel > 0 && nAna > 0 && (
        <div className="vc-finalize">
          <div className="vc-finalize-txt">
            <Icon name="check" size={17} stroke={2.4} />
            <span>Você já selecionou <strong>{nSel} candidato{nSel === 1 ? "" : "s"}</strong>. Quer recusar <strong>{nAna} em análise</strong> e enviar a mensagem de retorno no WhatsApp?</span>
          </div>
          <button className="vc-finalize-btn" onClick={recusarRestantes}><Icon name="whatsapp" size={15} /> Recusar os demais e avisar</button>
        </div>
      )}

      <div className={`vc-bar ${checked.length ? "active" : ""}`}>
        <label className="vc-checkall"><input type="checkbox" checked={allChecked} onChange={toggleAll} /> Selecionar todos</label>
        {checked.length > 0 ? (
          <div className="vc-batch">
            <span>{checked.length} marcado{checked.length === 1 ? "" : "s"}</span>
            <Btn size="sm" icon="check" onClick={() => aplicar("sel")}>Marcar selecionados</Btn>
            <Btn size="sm" variant="ghost" onClick={() => aplicar("nao")}>Marcar não selecionados</Btn>
            <button className="vc-apply-final" onClick={aplicarSelecaoFinal} title="Selecionar os marcados e recusar todos os demais"><Icon name="check" size={14} stroke={2.6} /> Aplicar seleção · recusar os demais</button>
          </div>
        ) : <span className="vc-bar-hint">Marque candidatos para definir o status em lote</span>}
      </div>

      <div className="vc-list">
        {lista.map((c) => {
          const st = stOf(c.id);
          const isCh = checked.includes(c.id);
          return (
            <div key={c.id} className={`vc-row ${isCh ? "on" : ""}`}>
              <input type="checkbox" className="vc-check" checked={isCh} onChange={() => toggleOne(c.id)} aria-label={`Marcar ${c.nome}`} />
              <div className="cand-av">{c.nome.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
              <div className="vc-info">
                <strong>{c.nome}</strong>
                <span>candidatou {c.quando.toLowerCase()} · {c.src === "linkedin" ? "via LinkedIn" : "Currículo PDF"}</span>
                {st === "nao" && <button className="wa-chip" onClick={() => { setPreview(c); setEditTpl(false); }}><Icon name="whatsapp" size={12} /> WhatsApp enviado · ver mensagem</button>}
              </div>
              <span className={`vc-st ${st}`}>{stLabel[st]}</span>
              <MatchRing value={c.match} size={42} />
              <div className="vc-acts">
                <button className={`vc-act sel ${st === "sel" ? "on" : ""}`} onClick={() => setOne(c.id, "sel")} title="Selecionar candidato"><Icon name="check" size={15} stroke={2.4} /></button>
                <button className={`vc-act nao ${st === "nao" ? "on" : ""}`} onClick={() => setOne(c.id, "nao")} title="Não selecionar (envia WhatsApp)"><Icon name="plus" size={15} stroke={2.4} style={{ transform: "rotate(45deg)" }} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <div className="wa-toast"><Icon name="whatsapp" size={17} /> {toast}</div>}

      {preview && (
        <div className="wa-modal" onClick={() => { setPreview(null); setEditTpl(false); }}>
          <div className="wa-card" onClick={(ev) => ev.stopPropagation()}>
            <div className="wa-head">
              <div className="wa-ava">{empInit}</div>
              <div className="wa-head-info">
                <strong>{empresa.nome}</strong>
                <span>{editTpl ? "Mensagem automática de retorno" : `para ${preview.nome} · ${preview.fone}`}</span>
              </div>
              <button className="wa-close" onClick={() => { setPreview(null); setEditTpl(false); }} aria-label="Fechar">×</button>
            </div>
            <div className="wa-body">
              {editTpl ? (
                <div className="wa-edit">
                  <textarea rows="7" value={draftTpl} onChange={(ev) => setDraftTpl(ev.target.value)} />
                  <p className="wa-hint">Variáveis disponíveis: <code>{"{nome}"}</code> <code>{"{vaga}"}</code> <code>{"{empresa}"}</code></p>
                  <div className="wa-edit-acts">
                    <Btn size="sm" icon="check" onClick={saveTpl}>Salvar modelo</Btn>
                    <button className="link" onClick={() => setEditTpl(false)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="wa-bubble">{renderWa(tpl, preview, vaga)}<span className="wa-time">agora ✓✓</span></div>
                  <button className="link wa-edit-link" onClick={() => { setDraftTpl(tpl); setEditTpl(true); }}>Editar mensagem padrão</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PacotesScreen({ go }) {
  const { PACOTES } = window;
  return (
    <div className="screen pacotes">
      <div className="pacotes-head">
        <span className="chapeu">Planos para empresas</span>
        <h1>Contrate com a audiência e a credibilidade do MaringáPost.</h1>
        <p>Sem taxa por candidato. Cancele quando quiser. Todos os planos incluem o selo de empresa verificada.</p>
      </div>
      <AlcanceShowcase go={go} />
      <div className="plans">
        {PACOTES.map((p) => (
          <div key={p.id} className={`plan ${p.destaque ? "feat" : ""}`}>
            {p.destaque && <span className="plan-flag">Mais popular</span>}
            <h3>{p.nome}</h3>
            <div className="plan-price">
              {p.preco ? <><span className="cur">R$</span><strong>{p.preco}</strong><span className="per">{p.periodo}</span></> : <strong className="consult">Sob consulta</strong>}
            </div>
            <span className="plan-vagas">{p.vagas}</span>
            {p.id === "p2" && <span className="plan-amp"><Icon name="bolt" size={13} /> Amplificação Alcance MaringáPost</span>}
            {p.id === "p3" && <span className="plan-amp"><Icon name="bolt" size={13} /> Amplificação total + campanha editorial</span>}
            <ul>{p.recursos.map((r, i) => <li key={i}><Icon name="check" size={15} stroke={2.4} /> {r}</li>)}</ul>
            <Btn full variant={p.destaque ? "primary" : "ghost"} onClick={() => go("empresa")}>{p.cta}</Btn>
          </div>
        ))}
      </div>
      <div className="pacotes-foot">
        <div className="pf-item"><Icon name="shield" size={22} /><div><strong>Verificação de CNPJ</strong><span>Toda empresa passa por checagem antes de publicar.</span></div></div>
        <div className="pf-item"><Icon name="chart" size={22} /><div><strong>Relatórios reais</strong><span>Acompanhe visualizações, candidatos e conversão.</span></div></div>
        <div className="pf-item"><Icon name="bolt" size={22} /><div><strong>Suporte humano</strong><span>Time de Maringá, no horário comercial.</span></div></div>
      </div>
    </div>
  );
}

Object.assign(window, { EmpresaAuth, PainelEmpresa, PacotesScreen });
