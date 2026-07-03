// screens-inclusao.jsx — Inclusão / Vagas afirmativas para PCD
const { useState: useStateP } = React;

// Recursos da plataforma para contratação de PCD
const PC_RECURSOS = [
  { id: "afirm", icon: "shield", nome: "Vagas afirmativas", desc: "Vagas exclusivas e prioritárias para pessoas com deficiência, sinalizadas com selo e fora da disputa geral." },
  { id: "perfil", icon: "doc", nome: "Perfil acessível", desc: "O candidato informa tipo de deficiência, CID e adaptações de que precisa — dados visíveis só para empresas inclusivas." },
  { id: "ambiente", icon: "building", nome: "Acessibilidade declarada", desc: "Cada empresa publica as adaptações reais do ambiente: rampas, Libras, leitor de tela, mobiliário e jornada." },
  { id: "apoio", icon: "users", nome: "Acompanhamento humano", desc: "Mediação na candidatura e no processo seletivo, garantindo um percurso sem barreiras até a contratação." },
];

// Adaptações / acessibilidades
const PC_ACESS = {
  fisica: { label: "Acessibilidade física", icon: "building" },
  libras: { label: "Intérprete de Libras", icon: "users" },
  leitor: { label: "Leitor de tela", icon: "eye" },
  flex: { label: "Jornada flexível", icon: "clock" },
  home: { label: "Home office", icon: "globe" },
  mobiliario: { label: "Mobiliário adaptado", icon: "layers" },
};

// Tipos de deficiência (para filtro)
const PC_DEFS = [
  { id: "fisica", label: "Física" },
  { id: "visual", label: "Visual" },
  { id: "auditiva", label: "Auditiva" },
  { id: "intelectual", label: "Intelectual" },
  { id: "reabilitado", label: "Reabilitado(a)" },
];
const PC_DEF_LABEL = Object.fromEntries(PC_DEFS.map((d) => [d.id, d.label]));

// Vagas afirmativas (PCD)
const PC_VAGAS = [
  { id: "pc1", titulo: "Assistente Administrativo", empresa: "e3", cidade: "Maringá", modalidade: "hibrido", salarioMin: 2200, salarioMax: 2800, defs: ["fisica", "auditiva", "visual", "reabilitado"], acess: ["fisica", "flex", "home", "leitor"], desc: "Rotinas de apoio administrativo em ambiente totalmente acessível, com mobiliário e softwares adaptados." },
  { id: "pc2", titulo: "Operador(a) de Caixa", empresa: "e1", cidade: "Sarandi", modalidade: "presencial", salarioMin: 1700, salarioMax: 2100, defs: ["fisica", "auditiva", "reabilitado"], acess: ["fisica", "libras", "mobiliario"], desc: "Atendimento no caixa com posto de trabalho adaptado e equipe treinada em comunicação inclusiva." },
  { id: "pc3", titulo: "Analista de Suporte Júnior", empresa: "e2", cidade: "Maringá", modalidade: "remoto", salarioMin: 2600, salarioMax: 3400, defs: ["fisica", "visual", "intelectual"], acess: ["home", "flex", "leitor"], desc: "Suporte técnico remoto com ferramentas compatíveis com leitores de tela e jornada flexível." },
  { id: "pc4", titulo: "Auxiliar de Recepção", empresa: "e6", cidade: "Maringá", modalidade: "presencial", salarioMin: 1800, salarioMax: 2300, defs: ["fisica", "auditiva", "reabilitado"], acess: ["fisica", "libras", "mobiliario", "flex"], desc: "Recepção e acolhimento em unidade de saúde com acessibilidade plena e intérprete de Libras disponível." },
  { id: "pc5", titulo: "Assistente de Marketing Digital", empresa: "e2", cidade: "Maringá", modalidade: "hibrido", salarioMin: 2400, salarioMax: 3000, defs: ["fisica", "visual", "intelectual", "reabilitado"], acess: ["home", "flex", "leitor", "fisica"], desc: "Produção de conteúdo e apoio a campanhas, com adaptação de ferramentas e ritmo de trabalho." },
  { id: "pc6", titulo: "Auxiliar de Logística", empresa: "e1", cidade: "Paiçandu", modalidade: "presencial", salarioMin: 1900, salarioMax: 2400, defs: ["auditiva", "intelectual", "reabilitado"], acess: ["fisica", "libras", "mobiliario"], desc: "Conferência e organização de estoque com processos visuais e acompanhamento de líder treinado." },
];

// Empresas com selo inclusivo
const PC_EMPRESAS = ["e3", "e1", "e2", "e6"];

function pcVagaEmp(id) { return window.empById(id); }

function PcVagaModal({ vaga, onClose, go }) {
  const [fase, setFase] = useStateP("form");
  const e = pcVagaEmp(vaga.empresa);
  return (
    <div className="pc-modal" onClick={onClose}>
      <div className="pc-card" onClick={(ev) => ev.stopPropagation()}>
        {fase === "form" ? (
          <>
            <div className="pc-card-head">
              <CompanyMark empresa={e} size={48} />
              <div className="pc-card-id">
                <strong>{vaga.titulo}</strong>
                <span>{e.nome} · {vaga.cidade}</span>
              </div>
              <button className="pc-x" onClick={onClose} aria-label="Fechar">×</button>
            </div>
            <span className="pc-seal"><Icon name="shield" size={13} stroke={2.2} /> Vaga afirmativa PCD</span>
            <p className="pc-card-desc">{vaga.desc}</p>
            <div className="pc-card-block">
              <h4>Deficiências contempladas</h4>
              <div className="pc-tags">{vaga.defs.map((d) => <span key={d} className="pc-tag def">{PC_DEF_LABEL[d]}</span>)}</div>
            </div>
            <div className="pc-card-block">
              <h4>Adaptações disponíveis</h4>
              <div className="pc-tags">{vaga.acess.map((a) => (
                <span key={a} className="pc-tag"><Icon name={PC_ACESS[a].icon} size={13} /> {PC_ACESS[a].label}</span>
              ))}</div>
            </div>
            <button className="pc-btn primary full" onClick={() => setFase("ok")}><Icon name="arrow" size={16} stroke={2} /> Candidatar-se</button>
            <p className="pc-fine">Seu perfil acessível será enviado apenas para esta empresa inclusiva.</p>
          </>
        ) : (
          <div className="pc-done">
            <div className="pc-done-check"><Icon name="check" size={32} stroke={2.6} /></div>
            <h3>Candidatura enviada</h3>
            <p>A <strong>{e.nome}</strong> receberá seu perfil e as adaptações que você indicou. Você será avisado a cada etapa do processo.</p>
            <button className="pc-btn primary full" onClick={() => { onClose(); go("painel-candidato"); }}>Ver minha conta</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PcVagaCard({ vaga, onOpen }) {
  const e = pcVagaEmp(vaga.empresa);
  return (
    <article className="pc-vaga" onClick={() => onOpen(vaga)}>
      <span className="pc-seal"><Icon name="shield" size={12} stroke={2.2} /> Afirmativa</span>
      <div className="pc-vaga-top">
        <CompanyMark empresa={e} size={42} />
        <div className="pc-vaga-id">
          <h3>{vaga.titulo}</h3>
          <span>{e.nome}</span>
        </div>
      </div>
      <div className="pc-vaga-meta">
        <span><Icon name="pin" size={14} /> {vaga.cidade}</span>
        <ModalidadeBadge modalidade={vaga.modalidade} />
      </div>
      <div className="pc-vaga-acess">
        {vaga.acess.slice(0, 3).map((a) => (
          <span key={a} className="pc-tag sm"><Icon name={PC_ACESS[a].icon} size={12} /> {PC_ACESS[a].label}</span>
        ))}
        {vaga.acess.length > 3 && <span className="pc-tag sm more">+{vaga.acess.length - 3}</span>}
      </div>
      <div className="pc-vaga-foot">
        <span className="pc-sal"><Money min={vaga.salarioMin} max={vaga.salarioMax} /></span>
        <span className="pc-vaga-link">Ver vaga <Icon name="arrow" size={15} stroke={2} /></span>
      </div>
    </article>
  );
}

function InclusaoScreen({ go }) {
  const [filtro, setFiltro] = useStateP("todas");
  const [ativa, setAtiva] = useStateP(null);

  const vagas = filtro === "todas" ? PC_VAGAS : PC_VAGAS.filter((v) => v.defs.includes(filtro));

  return (
    <div className="screen pc-screen">
      {/* Hero */}
      <section className="pc-hero">
        <div className="pc-hero-inner">
          <span className="pc-tag-hero">MaringáPost · Inclusão</span>
          <h1>Talento sem barreiras.</h1>
          <p>Vagas afirmativas para pessoas com deficiência no Norte do Paraná — com acessibilidade declarada, perfil adaptado e acompanhamento até a contratação. Inclusão de verdade, não só na cota.</p>
          <div className="pc-hero-acts">
            <button className="pc-btn primary big" onClick={() => document.querySelector(".pc-vagas-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Ver vagas afirmativas</button>
            <button className="pc-btn ghost big" onClick={() => go("cadastro-candidato")}>Criar meu perfil acessível</button>
          </div>
        </div>
        <div className="pc-hero-stats">
          <div><strong>{PC_VAGAS.length}</strong><span>vagas afirmativas abertas na região</span></div>
          <div><strong>2 a 5%</strong><span>das vagas reservadas a PCD por lei</span></div>
          <div><strong>{PC_EMPRESAS.length}</strong><span>empresas com selo inclusivo</span></div>
        </div>
      </section>

      {/* Recursos */}
      <section className="pc-rec-sec">
        <div className="pc-wrap">
          <span className="chapeu">Como funciona</span>
          <h2 className="pc-h2">Um caminho desenhado para incluir de verdade</h2>
          <div className="pc-recs">
            {PC_RECURSOS.map((r) => (
              <div key={r.id} className="pc-rec">
                <div className="pc-rec-ic"><Icon name={r.icon} size={22} /></div>
                <strong>{r.nome}</strong>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lei de Cotas */}
      <section className="pc-lei">
        <div className="pc-wrap pc-lei-inner">
          <div className="pc-lei-text">
            <span className="chapeu light">A inclusão é lei — e é bom negócio</span>
            <h2 className="pc-h2 light">A Lei de Cotas existe há mais de 30 anos. O talento sempre esteve aqui.</h2>
            <p>A Lei 8.213/91 determina que empresas com 100 ou mais funcionários reservem de 2% a 5% das vagas para pessoas com deficiência e reabilitados. Mais do que cumprir a cota, equipes diversas decidem melhor — e o MaringáPost conecta sua empresa a esse talento com respeito e estrutura.</p>
          </div>
          <ul className="pc-lei-list">
            <li><Icon name="check" size={18} stroke={2.4} /> Cumprimento da cota com candidatos qualificados</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Perfis com adaptações já mapeadas</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Selo de Empresa Inclusiva no seu perfil</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Apoio na adequação do processo seletivo</li>
          </ul>
        </div>
      </section>

      {/* Vagas */}
      <section className="pc-vagas-wrap">
        <div className="pc-wrap">
          <h2 className="pc-h2">Vagas afirmativas</h2>
          <div className="pc-filtros">
            <button className={filtro === "todas" ? "on" : ""} onClick={() => setFiltro("todas")}>Todas</button>
            {PC_DEFS.map((d) => (
              <button key={d.id} className={filtro === d.id ? "on" : ""} onClick={() => setFiltro(d.id)}>{d.label}</button>
            ))}
          </div>
          <div className="pc-vagas">
            {vagas.map((v) => <PcVagaCard key={v.id} vaga={v} onOpen={setAtiva} />)}
          </div>
          {vagas.length === 0 && <p className="pc-empty">Nenhuma vaga afirmativa para este perfil no momento. Cadastre-se para ser avisado.</p>}
        </div>
      </section>

      {/* Empresas inclusivas */}
      <section className="pc-emp-sec">
        <div className="pc-wrap">
          <span className="chapeu">Selo Empresa Inclusiva</span>
          <h2 className="pc-h2">Quem já contrata sem barreiras</h2>
          <div className="pc-emps">
            {PC_EMPRESAS.map((id) => {
              const e = window.empById(id);
              return (
                <button key={id} className="pc-emp" onClick={() => go("empresa-perfil", id)}>
                  <CompanyMark empresa={e} size={44} />
                  <div className="pc-emp-id">
                    <strong>{e.nome}</strong>
                    <span><Icon name="shield" size={12} stroke={2.2} /> Empresa Inclusiva</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pc-cta">
        <div className="pc-wrap pc-cta-inner">
          <div>
            <h2 className="pc-h2 light">Sua deficiência não define o que você entrega.</h2>
            <p>Crie um perfil acessível, escolha as adaptações de que precisa e candidate-se às vagas afirmativas da região. No seu ritmo, com o seu apoio.</p>
          </div>
          <button className="pc-btn light big" onClick={() => go("cadastro-candidato")}><Icon name="arrow" size={17} stroke={2} /> Criar meu perfil acessível</button>
        </div>
      </section>

      {ativa && <PcVagaModal vaga={ativa} onClose={() => setAtiva(null)} go={go} />}
    </div>
  );
}

Object.assign(window, { InclusaoScreen });
