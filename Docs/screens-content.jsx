// screens-content.jsx — partner banner, company content submission, admin moderation
const { useState: useStateCo } = React;

const CURRENT_CO = "e2"; // empresa logada no protótipo (Apitec)

const STATUS_META = {
  aprovada: { label: "Publicada", cls: "ok" },
  pendente: { label: "Em análise", cls: "warn" },
  reprovada: { label: "Reprovada", cls: "bad" },
};

// ---------- Partner logos banner (aba Vagas) ----------
function PartnerBanner({ go }) {
  const { EMPRESAS } = window;
  const row = [...EMPRESAS, ...EMPRESAS];
  return (
    <div className="partners">
      <div className="partners-inner">
        <span className="partners-label">Empresas parceiras<i>312 contratando agora</i></span>
        <div className="partners-track-wrap">
          <div className="partners-track">
            {row.map((e, i) => (
              <div className="partner" key={i} role="button" tabIndex={0} title={`Ver perfil de ${e.nome}`}
                onClick={() => go && go("empresa-perfil", e.id)}
                onKeyDown={(ev) => { if ((ev.key === "Enter" || ev.key === " ") && go) { ev.preventDefault(); go("empresa-perfil", e.id); } }}>
                <span className="partner-slot" onClick={(ev) => ev.stopPropagation()}>
                  <image-slot id={`plogo-${e.id}`} shape="rounded" radius="11" fit="cover" src={window.brandLogo(e.id)} placeholder="logo"></image-slot>
                </span>
                <span className="partner-name">{e.nome} <span className="partner-go"><Icon name="arrow" size={13} stroke={2.2} /></span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Publication card (Carreira & RH público) ----------
function PubMeta({ pub }) {
  const e = pub.empresa ? window.empById(pub.empresa) : null;
  return (
    <span className="byline">
      {e ? <>Conteúdo de marca · {e.nome}</> : <>Redação MaringáPost</>} · {pub.tempo} de leitura
    </span>
  );
}

// ---------- Company content panel (aba do painel da empresa) ----------
function CompanyContentPanel({ pubs, addPub }) {
  const { CATEGORIAS_PUB } = window;
  const mine = pubs.filter((p) => p.empresa === CURRENT_CO);
  const [creating, setCreating] = useStateCo(false);
  const [sent, setSent] = useStateCo(false);
  const [form, setForm] = useStateCo({ titulo: "", chapeu: "", categoria: CATEGORIAS_PUB[0], lead: "" });
  const submit = (e) => {
    e.preventDefault();
    addPub({ ...form, empresa: CURRENT_CO, tempo: "4 min", data: "Hoje" });
    setSent(true); setCreating(false);
    setForm({ titulo: "", chapeu: "", categoria: CATEGORIAS_PUB[0], lead: "" });
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="cc-wrap">
      <div className="cc-intro">
        <div>
          <h3>Publicações em Carreira &amp; RH</h3>
          <p>Conte a história da sua empresa para milhares de leitores. Toda publicação passa pela curadoria da redação do MaringáPost antes de ir ao ar.</p>
        </div>
        {!creating && <Btn icon="plus" onClick={() => setCreating(true)}>Nova publicação</Btn>}
      </div>

      {sent && <div className="cc-sent"><Icon name="check" size={18} stroke={2.4} /> Publicação enviada para aprovação da redação. Você será avisado quando for revisada.</div>}

      {creating && (
        <form className="form cc-form" onSubmit={submit}>
          <div className="cc-form-head"><h4>Nova publicação</h4><span className="cc-flow"><Icon name="shield" size={14} /> Vai para aprovação do admin</span></div>
          <div className="grid-2">
            <Field label="Chapéu (categoria curta)" required><input required value={form.chapeu} onChange={(e) => setForm({ ...form, chapeu: e.target.value })} placeholder="Ex: Employer branding" /></Field>
            <Field label="Editoria"><select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>{CATEGORIAS_PUB.map((c) => <option key={c}>{c}</option>)}</select></Field>
          </div>
          <Field label="Título" required><input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Um título que desperte interesse" /></Field>
          <Field label="Resumo / linha de apoio" required><textarea rows="3" required value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} placeholder="Resuma a publicação em uma ou duas frases." /></Field>
          <Field label="Imagem de capa">
            <div className="cc-upload"><Icon name="upload" size={18} /> Arraste uma imagem ou clique para enviar (JPG/PNG)</div>
          </Field>
          <div className="form-actions">
            <Btn variant="ghost" onClick={() => setCreating(false)}>Cancelar</Btn>
            <Btn type="submit" icon="arrow">Enviar para aprovação</Btn>
          </div>
        </form>
      )}

      <div className="cc-list">
        {mine.length === 0 && <p className="cc-empty">Você ainda não enviou publicações.</p>}
        {mine.map((p) => {
          const sm = STATUS_META[p.status];
          return (
            <div key={p.id} className="cc-item">
              <div className="cc-item-main">
                <div className="cc-item-top"><span className="chapeu">{p.chapeu}</span><span className={`pub-st ${sm.cls}`}>{sm.label}</span></div>
                <strong>{p.titulo}</strong>
                <span className="cc-item-meta">{p.categoria} · enviada {p.data}</span>
                {p.status === "reprovada" && p.motivo && <div className="cc-reject"><Icon name="shield" size={14} /> <span><b>Ajuste necessário:</b> {p.motivo}</span></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Admin moderation (conteúdo — legacy, substituído por screens-admin.jsx) ----------
function AdminScreenLegacy({ go, pubs, approvePub, rejectPub }) {
  const [tab, setTab] = useStateCo("pendente");
  const [rejecting, setRejecting] = useStateCo(null);
  const [motivo, setMotivo] = useStateCo("");
  const counts = {
    pendente: pubs.filter((p) => p.status === "pendente").length,
    aprovada: pubs.filter((p) => p.status === "aprovada").length,
    reprovada: pubs.filter((p) => p.status === "reprovada").length,
  };
  const list = pubs.filter((p) => p.status === tab);
  const doReject = (id) => { rejectPub(id, motivo || "Conteúdo não atende às diretrizes editoriais."); setRejecting(null); setMotivo(""); };

  return (
    <div className="screen panel admin">
      <div className="admin-bar">
        <div className="admin-bar-inner">
          <span className="admin-role"><Icon name="shield" size={15} /> Modo administrador · Redação</span>
          <button className="link" onClick={() => go("home")}>Sair do modo admin</button>
        </div>
      </div>
      <div className="panel-head">
        <div>
          <span className="chapeu">Moderação de conteúdo</span>
          <h1>Fila de aprovação</h1>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi n={counts.pendente} l="Aguardando revisão" icon="clock" />
        <Kpi n={counts.aprovada} l="Publicadas" icon="check" />
        <Kpi n={counts.reprovada} l="Reprovadas" icon="shield" />
        <Kpi n="312" l="Empresas que podem publicar" icon="users" />
      </div>

      <div className="panel-tabs">
        <button className={tab === "pendente" ? "on" : ""} onClick={() => setTab("pendente")}>Pendentes {counts.pendente > 0 && <span className="tab-count">{counts.pendente}</span>}</button>
        <button className={tab === "aprovada" ? "on" : ""} onClick={() => setTab("aprovada")}>Publicadas</button>
        <button className={tab === "reprovada" ? "on" : ""} onClick={() => setTab("reprovada")}>Reprovadas</button>
      </div>

      <div className="mod-list">
        {list.length === 0 && <p className="cc-empty">Nada por aqui.</p>}
        {list.map((p) => {
          const e = p.empresa ? window.empById(p.empresa) : null;
          return (
            <article key={p.id} className="mod-card">
              <div className="mod-preview"><Placeholder label="capa" ratio="4/3" radius={8} /></div>
              <div className="mod-body">
                <div className="mod-co">
                  {e ? <><CompanyMark empresa={e} size={28} /> <strong>{e.nome}</strong>{e.verificada && <Icon name="shield" size={13} style={{ color: "var(--accent)" }} />}</> : <strong>Redação MaringáPost</strong>}
                  <span className="mod-cat">{p.categoria}</span>
                </div>
                <span className="chapeu">{p.chapeu}</span>
                <h3>{p.titulo}</h3>
                <p>{p.lead}</p>
                <span className="cc-item-meta">Enviada {p.data} · {p.tempo} de leitura</span>
                {p.status === "reprovada" && p.motivo && <div className="cc-reject"><Icon name="shield" size={14} /> <span>{p.motivo}</span></div>}
              </div>
              {tab === "pendente" && (
                <div className="mod-actions">
                  {rejecting === p.id ? (
                    <div className="mod-reject-box">
                      <textarea rows="3" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo da reprovação (enviado à empresa)" autoFocus />
                      <div className="mrb-acts">
                        <Btn size="sm" variant="ghost" onClick={() => { setRejecting(null); setMotivo(""); }}>Cancelar</Btn>
                        <button className="btn btn-sm btn-bad" onClick={() => doReject(p.id)}>Confirmar reprovação</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Btn size="sm" icon="check" onClick={() => approvePub(p.id)}>Aprovar e publicar</Btn>
                      <button className="btn btn-sm btn-ghost" onClick={() => setRejecting(p.id)}>Reprovar</button>
                      <button className="link mod-prev">Pré-visualizar</button>
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Vagas Contextuais (Native Job Ads) ----------
// Casa as vagas abertas com o assunto da reportagem via palavras-chave (no produto real: embedding/IA).
function matchVagasContextuais(pub, max = 3) {
  const kws = (pub.keywords || []).map((k) => k.toLowerCase());
  let list = window.VAGAS.filter((v) =>
    kws.some((k) => (v.titulo + " " + v.area + " " + v.descricao).toLowerCase().includes(k)));
  if (list.length === 0 && pub.empresa) list = window.VAGAS.filter((v) => v.empresa === pub.empresa);
  return list.sort((a, b) => b.match - a.match).slice(0, max);
}

function NativeJobsWidget({ pub, go, compact }) {
  const vagas = matchVagasContextuais(pub, compact ? 2 : 3);
  if (vagas.length === 0) return null;
  return (
    <aside className={`njads ${compact ? "mid" : "end"}`} data-comment-anchor="native-job-ads">
      <div className="njads-head">
        <span className="njads-label"><Icon name="bolt" size={13} /> Vagas abertas neste setor</span>
        <span className="njads-tag">conteúdo patrocinado</span>
      </div>
      <div className="njads-list">
        {vagas.map((v) => {
          const e = window.empById(v.empresa);
          return (
            <button key={v.id} className="njads-row" onClick={() => go("vaga", v.id)}>
              <CompanyMark empresa={e} size={36} />
              <span className="njads-info">
                <strong>{v.titulo}</strong>
                <span>{e.nome} · {v.cidade} · <Money min={v.salarioMin} max={v.salarioMax} /></span>
              </span>
              <span className="njads-go">Ver vaga <Icon name="arrow" size={14} /></span>
            </button>
          );
        })}
      </div>
      {!compact && <p className="njads-foot">Vagas selecionadas automaticamente pela IA do MaringáPost com base no tema desta reportagem.</p>}
    </aside>
  );
}

// ---------- Leitura da reportagem ----------
function ArtigoScreen({ id, go, pubs }) {
  const list = pubs || window.PUBLICACOES;
  const pub = list.find((p) => p.id === id) || list.find((p) => p.status === "aprovada");
  if (!pub) return null;
  const e = pub.empresa ? window.empById(pub.empresa) : null;
  const corpo = pub.corpo || [
    pub.lead,
    "No produto final, este é o corpo completo da publicação enviada pela empresa e aprovada pela redação do MaringáPost.",
    "O sistema de vagas contextuais lê o tema do texto e injeta automaticamente, no meio e ao final da leitura, as vagas abertas mais relacionadas — transformando audiência editorial em candidaturas.",
  ];
  const meio = Math.min(2, corpo.length - 1);
  return (
    <div className="screen artigo">
      <button className="back" onClick={() => go("conteudo")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Carreira &amp; RH</button>
      <article className="artigo-body">
        <span className="chapeu">{pub.chapeu}</span>
        <h1>{pub.titulo}</h1>
        <p className="artigo-lead">{pub.lead}</p>
        <div className="artigo-byline">
          {e ? <><CompanyMark empresa={e} size={30} /> <span>Conteúdo de marca · <strong>{e.nome}</strong></span></> : <span>Por <strong>Redação MaringáPost</strong></span>}
          <span className="dot-sep">·</span>
          <span>{pub.data} · {pub.tempo} de leitura</span>
        </div>
        {pub.img
          ? <img className="artigo-hero-img" src={pub.img} alt={pub.titulo} />
          : <Placeholder label="foto da reportagem" ratio="21/10" radius={10} />}
        <div className="artigo-text">
          {corpo.slice(0, meio).map((p, i) => <p key={i}>{p}</p>)}
          <NativeJobsWidget pub={pub} go={go} compact />
          {corpo.slice(meio).map((p, i) => <p key={"b" + i}>{p}</p>)}
        </div>
      </article>
      <div className="artigo-end">
        <NativeJobsWidget pub={pub} go={go} />
      </div>
    </div>
  );
}

Object.assign(window, { PartnerBanner, CompanyContentPanel, PubMeta, CURRENT_CO, ArtigoScreen, NativeJobsWidget, matchVagasContextuais });
