// feature-alcance.jsx — "Vaga Amplificada / Alcance MaringáPost"
// Diferencial de venda: distribuição editorial + prova de alcance.
const { useState: useStateAl, useEffect: useEffectAl } = React;

const CANAIS = [
  { id: "home", nome: "Home do MaringáPost", reach: 184000, sub: "leitores únicos / mês", icon: "eye", planos: ["pro", "corp"] },
  { id: "news", nome: "Newsletter diária", reach: 24500, sub: "assinantes", icon: "doc", planos: ["pro", "corp"] },
  { id: "zap", nome: "Canal no WhatsApp", reach: 31200, sub: "inscritos", icon: "whatsapp", planos: ["pro", "corp"] },
  { id: "insta", nome: "Instagram @maringapost", reach: 96400, sub: "seguidores", icon: "users", planos: ["corp"] },
];
const fmt = (n) => n.toLocaleString("pt-BR");

// ---------- Vitrine (página de Pacotes) ----------
function AlcanceShowcase({ go }) {
  const total = CANAIS.reduce((s, c) => s + c.reach, 0);
  return (
    <section className="alc-show">
      <div className="alc-head">
        <span className="chapeu">Exclusivo MaringáPost · Não existe em outro portal</span>
        <h2>Sua vaga não é só um anúncio.<br />É notícia na cidade inteira.</h2>
        <p>Todo plano pago distribui suas vagas pela máquina editorial do MaringáPost — o veículo mais lido de Maringá. A mesma credibilidade que informa a cidade, agora trabalhando pela sua marca empregadora.</p>
      </div>

      <div className="alc-reach-banner">
        <div className="arb-num"><strong>{fmt(total)}+</strong><span>maringaenses alcançados por mês</span></div>
        <div className="arb-div" />
        <div className="arb-pts">
          <span><Icon name="check" size={16} stroke={2.4} /> Distribuição garantida, não leilão de anúncio</span>
          <span><Icon name="check" size={16} stroke={2.4} /> Credibilidade jornalística que o LinkedIn não tem</span>
          <span><Icon name="check" size={16} stroke={2.4} /> Audiência 100% local e qualificada</span>
        </div>
      </div>

      <div className="alc-channels">
        {CANAIS.map((c) => (
          <div key={c.id} className="alc-chan">
            <div className="alc-chan-head"><span className="alc-chan-ic"><Icon name={c.icon} size={17} /></span>{c.nome}</div>
            <ChannelMock id={c.id} />
            <div className="alc-chan-reach"><strong>{fmt(c.reach)}</strong> {c.sub}</div>
          </div>
        ))}
      </div>

      <div className="alc-tier">
        <div className="alc-tier-row"><span className="atr-label">Essencial</span><div className="atr-bar"><span style={{ width: "12%" }} /></div><span className="atr-val">Só portal</span></div>
        <div className="alc-tier-row pro"><span className="atr-label">Profissional</span><div className="atr-bar"><span style={{ width: "62%" }} /></div><span className="atr-val">Portal + Home + Newsletter + WhatsApp</span></div>
        <div className="alc-tier-row corp"><span className="atr-label">Corporativo</span><div className="atr-bar"><span style={{ width: "100%" }} /></div><span className="atr-val">Tudo + Instagram + campanha editorial dedicada</span></div>
      </div>
    </section>
  );
}

// Tiny channel mockups (editorial, no real screenshots)
function ChannelMock({ id }) {
  if (id === "home") return (
    <div className="cmock cmock-home">
      <div className="cm-bar"><b>MARINGÁ POST</b><span>EMPREGOS</span></div>
      <div className="cm-feat"><span className="cm-tag">PATROCINADO</span><div className="cm-line w80" /><div className="cm-line w50" /></div>
      <div className="cm-rows"><div className="cm-line w70" /><div className="cm-line w90" /></div>
    </div>
  );
  if (id === "news") return (
    <div className="cmock cmock-news">
      <div className="cm-news-head"><b>Bom dia, Maringá ☕</b><span>terça · 09 jun</span></div>
      <div className="cm-news-block"><span className="cm-tag green">VAGA EM DESTAQUE</span><div className="cm-line w90" /><div className="cm-line w60" /><div className="cm-cta">Ver vaga →</div></div>
    </div>
  );
  if (id === "zap") return (
    <div className="cmock cmock-zap">
      <div className="cm-zap-head"><span className="cm-zap-dot" /> Canal MaringáPost</div>
      <div className="cm-bubble"><b>🟢 Nova vaga em Maringá</b><div className="cm-line w80" /><div className="cm-line w55" /><div className="cm-zap-link">empregos.maringapost…</div></div>
    </div>
  );
  return (
    <div className="cmock cmock-insta">
      <div className="cm-insta-head"><span className="cm-insta-av" /> maringapost</div>
      <div className="cm-insta-img"><span className="cm-tag">CONTRATANDO</span></div>
      <div className="cm-insta-foot"><span>♥ 2.140</span><span>↗</span></div>
    </div>
  );
}

// ---------- Painel de Alcance (área da empresa) ----------
const ORIGENS = [
  { nome: "Busca no portal", n: 38, tone: "var(--ink-40)" },
  { nome: "Newsletter", n: 41, tone: "var(--accent-2)" },
  { nome: "Canal WhatsApp", n: 52, tone: "var(--accent)" },
  { nome: "Instagram", n: 17, tone: "var(--ink-80)" },
];

function AlcancePanel() {
  const [reach, setReach] = useStateAl(0);
  const totalReal = 47320;
  useEffectAl(() => {
    let r = 0; const step = totalReal / 28;
    const t = setInterval(() => { r += step; if (r >= totalReal) { r = totalReal; clearInterval(t); } setReach(Math.round(r)); }, 22);
    return () => clearInterval(t);
  }, []);
  const totalCand = ORIGENS.reduce((s, o) => s + o.n, 0);
  const maxO = Math.max(...ORIGENS.map((o) => o.n));
  return (
    <div className="alc-panel">
      <div className="alc-panel-grid">
        <div className="alc-big">
          <span className="chapeu">Alcance da campanha · últimos 30 dias</span>
          <div className="alc-big-num">{fmt(reach)}</div>
          <span className="alc-big-sub">pessoas alcançadas pela amplificação editorial</span>
          <div className="alc-mult"><Icon name="bolt" size={16} /> <strong>3,4×</strong> mais candidatos que vagas sem amplificação</div>
          <div className="alc-chan-list">
            {CANAIS.map((c) => {
              const share = Math.round((c.reach / CANAIS.reduce((s, x) => s + x.reach, 0)) * 100);
              return (
                <div key={c.id} className="alc-chan-line">
                  <span className="acl-name"><Icon name={c.icon} size={15} /> {c.nome}</span>
                  <div className="acl-bar"><span style={{ width: `${share}%` }} /></div>
                  <span className="acl-val">{share}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="alc-side">
          <div className="alc-card">
            <SectionHead titulo="Candidatos por origem" />
            <div className="origem-list">
              {ORIGENS.map((o) => (
                <div key={o.nome} className="origem-row">
                  <span>{o.nome}</span>
                  <div className="origem-bar"><span style={{ width: `${(o.n / maxO) * 100}%`, background: o.tone }} /></div>
                  <b>{o.n}</b>
                </div>
              ))}
            </div>
            <div className="origem-foot"><strong>{totalCand}</strong> candidatos · <span className="acc-em">68%</span> vieram dos canais do MaringáPost</div>
          </div>

          <div className="bench-card">
            <span className="chapeu">Inteligência de mercado · exclusivo assinantes</span>
            <h4>Benchmark salarial regional</h4>
            <div className="bench-scale">
              <div className="bench-track"><span className="bench-fill" /><span className="bench-you" style={{ left: "38%" }}>você</span><span className="bench-avg" style={{ left: "56%" }}>média</span></div>
              <div className="bench-labels"><span>R$ 3.500</span><span>R$ 4.200</span><span>R$ 5.100</span></div>
            </div>
            <p className="bench-note"><Icon name="bolt" size={14} /> Sua faixa está <strong>8% abaixo</strong> da média de Maringá para Analista de Dados — candidatos qualificados podem priorizar outras ofertas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AlcanceShowcase, AlcancePanel, CANAIS });
