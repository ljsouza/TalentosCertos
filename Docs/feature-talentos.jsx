// feature-talentos.jsx — Radar de Talentos: matching por consumo de conteúdo
const { useState: useStateT } = React;

const INTERESSES = ["Finanças", "Tecnologia", "Saúde", "Logística", "Marketing", "Indústria"];

const TALENTOS = [
  { id: 8421, leitura: [["Finanças", 82], ["Tecnologia", 74], ["Carreira", 41]], arch: "Analítico-Estratégico", skills: ["SQL", "Excel", "Power BI"], match: 91, artigos: 34, ativo: "ativo há 2 dias" },
  { id: 5117, leitura: [["Tecnologia", 88], ["Finanças", 63], ["Indústria", 35]], arch: "Executor-Consistente", skills: ["Python", "Inglês", "Gestão de projetos"], match: 87, artigos: 51, ativo: "ativo hoje" },
  { id: 9043, leitura: [["Finanças", 77], ["Marketing", 58], ["Carreira", 52]], arch: "Líder-Mobilizador", skills: ["Negociação", "Vendas", "Excel"], match: 79, artigos: 27, ativo: "ativo há 5 dias" },
  { id: 2268, leitura: [["Saúde", 91], ["Carreira", 44], ["Tecnologia", 38]], arch: "Colaborador-Empático", skills: ["Atendimento", "Organização"], match: 74, artigos: 42, ativo: "ativo ontem" },
  { id: 6590, leitura: [["Logística", 85], ["Indústria", 71], ["Tecnologia", 47]], arch: "Executor-Consistente", skills: ["Pacote Office", "Gestão de projetos"], match: 81, artigos: 19, ativo: "ativo hoje" },
  { id: 3375, leitura: [["Marketing", 79], ["Tecnologia", 66], ["Carreira", 60]], arch: "Líder-Mobilizador", skills: ["Criatividade", "Comunicação", "Marketing"], match: 76, artigos: 38, ativo: "ativo há 3 dias" },
];

function TalentRadar() {
  const [filtro, setFiltro] = useStateT("Finanças");
  const [convites, setConvites] = useStateT([]);
  const list = TALENTOS
    .filter((t) => !filtro || t.leitura.some(([tema, pct]) => tema === filtro && pct >= 50))
    .sort((a, b) => b.match - a.match);
  const convidar = (id) => setConvites((c) => [...c, id]);

  return (
    <div className="tr-wrap">
      <div className="tr-intro">
        <div>
          <span className="ai-badge"><Icon name="bolt" size={14} /> Radar de talentos · IA</span>
          <h3>Talentos pelo que eles leem</h3>
          <p>A IA analisa o consumo de conteúdo no MaringáPost e revela perfis com interesse real no seu setor — antes mesmo de se candidatarem. Anônimos até aceitarem seu convite.</p>
        </div>
        <div className="tr-lgpd"><Icon name="shield" size={16} /> Perfis anonimizados, com consentimento do leitor (LGPD). A identidade só é revelada se o talento aceitar o convite.</div>
      </div>

      <div className="tr-filter">
        <span>Interesse de leitura:</span>
        {INTERESSES.map((i) => (
          <button key={i} className={`pill ${filtro === i ? "on" : ""}`} onClick={() => setFiltro(filtro === i ? "" : i)}>{i}</button>
        ))}
      </div>

      <div className="tr-grid">
        {list.map((t) => {
          const enviado = convites.includes(t.id);
          return (
            <div key={t.id} className="tr-card">
              <div className="tr-top">
                <div className="tr-anon" aria-hidden="true"><Icon name="eye" size={18} /></div>
                <div className="tr-id">
                  <strong>Talento anônimo #{t.id}</strong>
                  <span>{t.artigos} matérias lidas em 90 dias · {t.ativo}</span>
                </div>
                <div className="cand-match" title="Compatibilidade estimada pela IA com o perfil que sua empresa busca">
                  <MatchRing value={t.match} size={44} />
                  <span>match<br />por IA</span>
                </div>
              </div>
              <div className="tr-reads">
                {t.leitura.map(([tema, pct]) => (
                  <div key={tema} className="tr-read">
                    <span className="tr-read-tema">{tema}</span>
                    <div className="tr-read-bar"><span style={{ width: pct + "%" }} /></div>
                    <b>{pct}%</b>
                  </div>
                ))}
              </div>
              <div className="tr-meta">
                <span className="ai-tag soft">{t.arch}</span>
                {t.skills.map((s) => <span key={s} className="ai-tag">{s}</span>)}
              </div>
              <div className="tr-foot">
                {enviado ? (
                  <span className="tr-sent"><Icon name="check" size={16} stroke={2.4} /> Convite enviado — aguardando o talento aceitar</span>
                ) : (
                  <Btn size="sm" full icon="bolt" onClick={() => convidar(t.id)}>Convidar para uma vaga</Btn>
                )}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="cc-empty">Nenhum talento com leitura forte nesse tema. Tente outro interesse.</p>}
      </div>

      <p className="tr-note">Disponível nos planos <strong>Profissional</strong> (5 convites/mês) e <strong>Corporativo</strong> (ilimitado). Exclusivo MaringáPost: nenhum job board tem dados de leitura editorial.</p>
    </div>
  );
}

// Card do candidato: perfil de leitura + consentimento
function ReadingProfileCard() {
  const [visivel, setVisivel] = useStateT(() => {
    try { return localStorage.getItem("mp_read_optin") !== "off"; } catch { return true; }
  });
  const toggle = () => {
    const v = !visivel; setVisivel(v);
    try { localStorage.setItem("mp_read_optin", v ? "on" : "off"); } catch {}
  };
  return (
    <div className="rp-card">
      <SectionHead chapeu="Só você vê os detalhes" titulo="Seu perfil de leitura" />
      <div className="tr-reads">
        {[["Finanças", 82], ["Tecnologia", 74], ["Carreira", 41]].map(([tema, pct]) => (
          <div key={tema} className="tr-read">
            <span className="tr-read-tema">{tema}</span>
            <div className="tr-read-bar"><span style={{ width: pct + "%" }} /></div>
            <b>{pct}%</b>
          </div>
        ))}
      </div>
      <button className="rp-optin" onClick={toggle} role="switch" aria-checked={visivel}>
        <span className={`switch ${visivel ? "on" : ""}`} />
        <span className="rp-optin-txt">
          <strong>{visivel ? "Visível anonimamente para empresas" : "Invisível para empresas"}</strong>
          <span>{visivel ? "Empresas veem seus interesses, nunca seu nome. Você decide se aceita convites." : "Ative para receber convites de empresas que buscam seu perfil."}</span>
        </span>
      </button>
    </div>
  );
}

Object.assign(window, { TalentRadar, ReadingProfileCard });
