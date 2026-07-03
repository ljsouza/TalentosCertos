// screens-challenge.jsx — Recrutamento por Desafios (avaliação e ranking por IA)
const { useState: useStateCh } = React;

const CH_TIPOS = [
  { id: "prog", icon: "bolt", nome: "Programação", desc: "Resolva um problema real de código", entrega: "Repositório ou solução funcional" },
  { id: "design", icon: "layers", nome: "Design", desc: "Crie uma peça a partir de um briefing", entrega: "Arquivo visual ou protótipo" },
  { id: "vendas", icon: "chat", nome: "Vendas", desc: "Grave um pitch convencendo o cliente", entrega: "Vídeo de até 3 minutos" },
  { id: "dados", icon: "chart", nome: "Dados", desc: "Analise um dataset e tire conclusões", entrega: "Dashboard ou relatório" },
  { id: "redacao", icon: "doc", nome: "Redação", desc: "Escreva sobre um tema proposto", entrega: "Texto ou artigo" },
  { id: "mkt", icon: "star", nome: "Marketing", desc: "Monte um plano para um cenário dado", entrega: "Apresentação ou campanha" },
];

const CH_DESAFIOS = [
  { id: "d1", tipo: "prog", empresa: "TecnoVale Sistemas", titulo: "API de roteirização de entregas", brief: "Construa um endpoint que receba uma lista de endereços e devolva a rota mais curta. Avaliamos lógica, clareza e tratamento de erros — não a linguagem.", premio: "Vaga de Dev Pleno · R$ 7.000", prazo: "5 dias", participantes: 48, skills: ["Lógica", "APIs", "Algoritmos"] },
  { id: "d2", tipo: "design", empresa: "Sabor & Cia", titulo: "Identidade para nova linha de produtos", brief: "Crie o conceito visual e uma embalagem para uma linha de molhos artesanais. Buscamos personalidade de marca e domínio de composição.", premio: "Vaga de Designer + portfólio publicado", prazo: "7 dias", participantes: 31, skills: ["Branding", "Embalagem", "Tipografia"] },
  { id: "d3", tipo: "vendas", empresa: "ImobPrime", titulo: "Pitch de 90 segundos: venda este imóvel", brief: "Grave um vídeo apresentando um apartamento difícil de vender. Avaliamos argumentação, escuta e energia — currículo não conta aqui.", premio: "Vaga de Consultor + comissão garantida", prazo: "4 dias", participantes: 67, skills: ["Persuasão", "Comunicação", "Storytelling"] },
  { id: "d4", tipo: "dados", empresa: "AgroNorte", titulo: "O que explica a queda na safra?", brief: "Receba um dataset de produtividade e identifique os fatores que mais impactaram o resultado. Queremos raciocínio analítico.", premio: "Vaga de Analista de Dados Jr", prazo: "6 dias", participantes: 25, skills: ["SQL", "Análise", "Visualização"] },
];

const CH_RANK = [
  { pos: 1, nome: "Mariana Soares", score: 94, dims: { "Qualidade técnica": 96, "Criatividade": 92, "Clareza": 95 }, nota: "Solução elegante e bem documentada.", flag: "Autodidata · sem diploma na área" },
  { pos: 2, nome: "Pedro Henrique Alves", score: 91, dims: { "Qualidade técnica": 93, "Criatividade": 88, "Clareza": 92 }, nota: "Código robusto, ótimo tratamento de erros.", flag: "2 anos de experiência" },
  { pos: 3, nome: "Júlia Tavares", score: 88, dims: { "Qualidade técnica": 90, "Criatividade": 90, "Clareza": 83 }, nota: "Abordagem criativa, faltou documentar.", flag: "Estudante do 3º período" },
  { pos: 4, nome: "Carlos Eduardo Lima", score: 84, dims: { "Qualidade técnica": 85, "Criatividade": 80, "Clareza": 87 }, nota: "Sólido e direto ao ponto.", flag: "Migrando de carreira" },
];

function chIniciais(n) { return n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase(); }

function ChallengeModal({ desafio, onClose }) {
  const [tab, setTab] = useStateCh("brief"); // brief | ranking
  const tipo = CH_TIPOS.find((t) => t.id === desafio.tipo);
  return (
    <div className="ch-modal" onClick={onClose}>
      <div className="ch-card" onClick={(e) => e.stopPropagation()}>
        <button className="ch-x" onClick={onClose} aria-label="Fechar">×</button>
        <span className="ch-card-tipo"><Icon name={tipo.icon} size={14} /> {tipo.nome}</span>
        <h3 className="ch-card-title">{desafio.titulo}</h3>
        <span className="ch-card-emp">{desafio.empresa}</span>
        <div className="ch-tabs">
          <button className={tab === "brief" ? "on" : ""} onClick={() => setTab("brief")}>O desafio</button>
          <button className={tab === "ranking" ? "on" : ""} onClick={() => setTab("ranking")}>Ranking da IA</button>
        </div>
        {tab === "brief" ? (
          <div className="ch-brief">
            <p>{desafio.brief}</p>
            <div className="ch-brief-meta">
              <div><span>Entrega</span><strong>{tipo.entrega}</strong></div>
              <div><span>Prazo</span><strong>{desafio.prazo}</strong></div>
              <div><span>Recompensa</span><strong>{desafio.premio}</strong></div>
            </div>
            <div className="ch-skills">{desafio.skills.map((s) => <span key={s}>{s}</span>)}</div>
            <button className="ch-btn primary full big"><Icon name="bolt" size={17} stroke={2} /> Aceitar desafio</button>
            <p className="ch-fine">Sua entrega é avaliada às cegas pela IA — sem nome, foto ou currículo. Só o que você produziu.</p>
          </div>
        ) : (
          <div className="ch-ranking">
            <div className="ch-rank-note"><Icon name="shield" size={15} /> Avaliação cega: a IA pontua só a entrega. O currículo aparece depois, para você se surpreender.</div>
            {CH_RANK.map((r) => (
              <div key={r.pos} className={`ch-rank-row ${r.pos === 1 ? "top" : ""}`}>
                <span className="ch-rank-pos">{r.pos}º</span>
                <div className="ch-rank-ava">{chIniciais(r.nome)}</div>
                <div className="ch-rank-main">
                  <div className="ch-rank-id"><strong>{r.nome}</strong><span className="ch-rank-flag">{r.flag}</span></div>
                  <div className="ch-rank-dims">
                    {Object.entries(r.dims).map(([k, v]) => (
                      <div key={k} className="ch-dim"><i>{k}</i><div className="ch-dim-bar"><span style={{ width: v + "%" }} /></div><b>{v}</b></div>
                    ))}
                  </div>
                  <p className="ch-rank-nota">“{r.nota}”</p>
                </div>
                <div className="ch-rank-score"><strong>{r.score}</strong><span>score IA</span></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeScreen({ go }) {
  const [ativo, setAtivo] = useStateCh(null);
  return (
    <div className="screen ch-screen">
      {/* Hero */}
      <section className="ch-hero">
        <div className="ch-hero-inner">
          <span className="ch-tag"><Icon name="bolt" size={14} stroke={2} /> Recrutamento por Desafios</span>
          <h1>O melhor talento nem sempre tem o melhor currículo.</h1>
          <p>Esqueça o PDF. A empresa lança um desafio, você mostra o que sabe fazer de verdade, e a IA avalia cada entrega às cegas — sem nome, sem foto, sem diploma. Só resultado.</p>
          <div className="ch-hero-acts">
            <button className="ch-btn primary big" onClick={() => document.querySelector(".ch-open-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Ver desafios abertos</button>
            <button className="ch-btn ghost big" onClick={() => go("empresa")}>Lançar um desafio</button>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="ch-how">
        <div className="ch-wrap">
          <h2 className="ch-h2">Como funciona</h2>
          <div className="ch-steps">
            {[
              { n: "1", t: "A empresa lança o desafio", d: "Um problema real do dia a dia — um trecho de código, um briefing de design, um pitch de venda." },
              { n: "2", t: "Os talentos entregam", d: "Cada participante resolve do seu jeito e envia a solução pela plataforma, no prazo definido." },
              { n: "3", t: "A IA avalia e classifica", d: "Cada entrega é pontuada por critérios objetivos — qualidade, criatividade, clareza — e ranqueada." },
              { n: "4", t: "A empresa conhece o talento", d: "Só então o perfil é revelado. Muitas vezes, o 1º lugar não teria passado na triagem de currículo." },
            ].map((s) => (
              <div key={s.n} className="ch-step"><span className="ch-step-n">{s.n}</span><strong>{s.t}</strong><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos */}
      <section className="ch-tipos-sec">
        <div className="ch-wrap">
          <h2 className="ch-h2">Desafios para cada talento</h2>
          <div className="ch-tipos">
            {CH_TIPOS.map((t) => (
              <div key={t.id} className="ch-tipo">
                <div className="ch-tipo-ic"><Icon name={t.icon} size={20} /></div>
                <div className="ch-tipo-txt"><strong>{t.nome}</strong><p>{t.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desafios abertos */}
      <section className="ch-open-wrap">
        <div className="ch-wrap">
          <h2 className="ch-h2">Desafios abertos agora</h2>
          <div className="ch-open">
            {CH_DESAFIOS.map((d) => {
              const tipo = CH_TIPOS.find((t) => t.id === d.tipo);
              return (
                <article key={d.id} className="ch-desafio" onClick={() => setAtivo(d)}>
                  <div className="ch-desafio-top">
                    <span className="ch-desafio-tipo"><Icon name={tipo.icon} size={13} /> {tipo.nome}</span>
                    <span className="ch-desafio-prazo"><Icon name="clock" size={13} /> {d.prazo}</span>
                  </div>
                  <h3>{d.titulo}</h3>
                  <span className="ch-desafio-emp">{d.empresa}</span>
                  <p className="ch-desafio-brief">{d.brief}</p>
                  <div className="ch-desafio-premio"><Icon name="star" size={14} stroke={2} /> {d.premio}</div>
                  <div className="ch-desafio-foot">
                    <span className="ch-desafio-part"><Icon name="users" size={14} /> {d.participantes} participantes</span>
                    <span className="ch-desafio-cta">Ver desafio <Icon name="arrow" size={14} stroke={2} /></span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ch-cta">
        <div className="ch-wrap ch-cta-inner">
          <div>
            <h2 className="ch-h2 light">Contrate pelo que a pessoa faz — não pelo que ela escreveu.</h2>
            <p>Lance um desafio em minutos, receba entregas reais e deixe a IA revelar quem realmente entrega. Diversidade e meritocracia no mesmo processo.</p>
          </div>
          <div className="ch-cta-btns">
            <button className="ch-btn light big" onClick={() => go("empresa")}>Lançar um desafio</button>
            <button className="ch-btn ghost big" onClick={() => go("cadastro-candidato")}>Quero participar</button>
          </div>
        </div>
      </section>

      {ativo && <ChallengeModal desafio={ativo} onClose={() => setAtivo(null)} />}
    </div>
  );
}

Object.assign(window, { ChallengeScreen });
