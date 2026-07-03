// screens-senior.jsx — Banco de Talentos 50+ (pré-aposentadoria e experiência sênior)
const { useState: useStateS } = React;

const SR_MODOS = [
  { id: "mentoria", icon: "users", nome: "Mentorias", desc: "Acompanhamento individual de lideranças e equipes mais jovens, com a bagagem de quem já trilhou o caminho." },
  { id: "conselho", icon: "shield", nome: "Conselhos consultivos", desc: "Assento consultivo para orientar estratégia, governança e decisões críticas do negócio." },
  { id: "projeto", icon: "bolt", nome: "Projetos temporários", desc: "Liderança de projetos pontuais, viradas de operação e gestão de crises por prazo definido." },
  { id: "treino", icon: "chart", nome: "Treinamentos", desc: "Capacitação técnica e comportamental, transmitindo conhecimento que não está nos manuais." },
];

const SR_PROS = [
  { id: "s1", nome: "Roberto Mendes", idade: 62, ex: "ex-Diretor Industrial", anos: 35, area: "Operações & Manufatura", oferece: ["mentoria", "conselho"], nota: 5.0, eng: 24, frase: "Reestruturei três fábricas no Paraná. Hoje ajudo gestores a fazer mais com menos, sem perder gente boa pelo caminho." },
  { id: "s2", nome: "Vera Lúcia Camargo", idade: 58, ex: "ex-CFO", anos: 30, area: "Finanças & Controladoria", oferece: ["conselho", "projeto"], nota: 4.9, eng: 18, frase: "Passei por duas crises econômicas no comando financeiro. Sei onde uma empresa costuma sangrar antes de perceber." },
  { id: "s3", nome: "Antônio Carlos Ferreira", idade: 65, ex: "ex-Gerente Comercial", anos: 40, area: "Vendas & Distribuição", oferece: ["mentoria", "treino"], nota: 4.8, eng: 31, frase: "Construí canais de venda do zero em todo o Norte do Paraná. Ensino o que nenhum curso de vendas conta." },
  { id: "s4", nome: "Sônia Rezende", idade: 56, ex: "ex-Diretora de RH", anos: 28, area: "Gestão de Pessoas", oferece: ["treino", "mentoria"], nota: 5.0, eng: 27, frase: "Formei lideranças que hoje comandam grandes empresas. Cultura não se decreta — se constrói com método." },
  { id: "s5", nome: "Paulo Tavares", idade: 60, ex: "ex-Engenheiro-chefe", anos: 34, area: "Engenharia & Projetos", oferece: ["projeto", "conselho"], nota: 4.9, eng: 15, frase: "Toquei obras que muita gente achou impossíveis no prazo. Entro, organizo o caos e entrego." },
  { id: "s6", nome: "Helena Costa", idade: 59, ex: "ex-CMO", anos: 31, area: "Marketing & Marca", oferece: ["mentoria", "projeto"], nota: 4.8, eng: 22, frase: "Marca se constrói com consistência, não com modismo. Ajudo times a enxergar o longo prazo." },
];

const SR_MODO_LABEL = { mentoria: "Mentoria", conselho: "Conselho", projeto: "Projeto", treino: "Treinamento" };

function srIniciais(n) { return n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase(); }

function SrInviteModal({ pro, onClose }) {
  const [fase, setFase] = useStateS("form");
  const [modo, setModo] = useStateS(pro.oferece[0]);
  const [msg, setMsg] = useStateS("");
  const enviar = () => { setFase("enviado"); };

  return (
    <div className="sr-modal" onClick={onClose}>
      <div className="sr-card" onClick={(e) => e.stopPropagation()}>
        {fase === "form" ? (
          <>
            <div className="sr-card-head">
              <div className="sr-ava lg">{srIniciais(pro.nome)}</div>
              <div className="sr-card-id">
                <strong>{pro.nome}</strong>
                <span>{pro.ex} · {pro.anos} anos de carreira</span>
                <span className="sr-card-area">{pro.area}</span>
              </div>
              <button className="sr-x" onClick={onClose} aria-label="Fechar">×</button>
            </div>
            <label className="sr-field">
              <span>Como gostaria de contar com {pro.nome.split(" ")[0]}?</span>
              <div className="sr-modo-opts">
                {pro.oferece.map((m) => (
                  <button key={m} className={modo === m ? "on" : ""} onClick={() => setModo(m)}>{SR_MODO_LABEL[m]}</button>
                ))}
              </div>
            </label>
            <label className="sr-field">
              <span>Mensagem (opcional)</span>
              <textarea rows="3" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Conte brevemente o desafio em que gostaria de contar com essa experiência…" />
            </label>
            <button className="sr-btn primary full" onClick={enviar}><Icon name="arrow" size={16} stroke={2} /> Enviar convite</button>
            <p className="sr-fine">Combinação de formato, agenda e valor é feita diretamente com o profissional.</p>
          </>
        ) : (
          <div className="sr-done">
            <div className="sr-done-check"><Icon name="check" size={32} stroke={2.6} /></div>
            <h3>Convite enviado</h3>
            <p><strong>{pro.nome}</strong> receberá seu convite para <strong>{SR_MODO_LABEL[modo].toLowerCase()}</strong> e responderá em breve para alinharem os detalhes.</p>
            <button className="sr-btn primary full" onClick={onClose}>Concluir</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SrProCard({ pro, onInvite }) {
  return (
    <article className="sr-pro">
      <div className="sr-pro-head">
        <div className="sr-ava">{srIniciais(pro.nome)}</div>
        <div className="sr-pro-id">
          <strong>{pro.nome}</strong>
          <span>{pro.ex} · <b>{pro.idade} anos</b></span>
        </div>
      </div>
      <p className="sr-frase">“{pro.frase}”</p>
      <div className="sr-pro-area"><Icon name="building" size={14} /> {pro.area}</div>
      <div className="sr-pro-foot">
        <div className="sr-pro-stats">
          <span><b>{pro.anos}</b> anos</span>
          <span><Icon name="star" size={13} stroke={0} style={{ fill: "var(--accent-2)" }} /> {pro.nota.toFixed(1)}</span>
        </div>
        <div className="sr-pro-modos">{pro.oferece.map((m) => <span key={m}>{SR_MODO_LABEL[m]}</span>)}</div>
      </div>
      <button className="sr-btn full" onClick={() => onInvite(pro)}>Convidar</button>
    </article>
  );
}

function SeniorScreen({ go }) {
  const [ativo, setAtivo] = useStateS(null);

  return (
    <div className="screen sr-screen">
      {/* Hero */}
      <section className="sr-hero">
        <div className="sr-hero-inner">
          <span className="sr-tag">MaringáPost · Banco de Talentos 50+</span>
          <h1>A experiência não se aposenta.</h1>
          <p>Décadas de bagagem profissional a serviço de quem está crescendo. Conecte sua empresa a executivos e especialistas 50+ e 60+ para mentorias, conselhos, projetos e treinamentos.</p>
          <div className="sr-hero-acts">
            <button className="sr-btn primary big" onClick={() => document.querySelector(".sr-pros-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Conhecer profissionais</button>
            <button className="sr-btn ghost big" onClick={() => go("cadastro-candidato")}>Tenho experiência para compartilhar</button>
          </div>
        </div>
        <div className="sr-hero-stats">
          <div><strong>40+</strong><span>anos de carreira nos perfis mais sêniores</span></div>
          <div><strong>4 formatos</strong><span>de colaboração, do pontual ao recorrente</span></div>
          <div><strong>0</strong><span>plataformas regionais olhando para esse talento</span></div>
        </div>
      </section>

      {/* Modos */}
      <section className="sr-modos-sec">
        <div className="sr-wrap">
          <span className="chapeu">Formas de colaborar</span>
          <h2 className="sr-h2">Experiência aplicada do jeito que sua empresa precisa</h2>
          <div className="sr-modos">
            {SR_MODOS.map((m) => (
              <div key={m.id} className="sr-modo">
                <div className="sr-modo-ic"><Icon name={m.icon} size={22} /></div>
                <strong>{m.nome}</strong>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por que */}
      <section className="sr-why">
        <div className="sr-wrap sr-why-inner">
          <div className="sr-why-text">
            <span className="chapeu light">O mercado que ninguém olha</span>
            <h2 className="sr-h2 light">Talento que as plataformas descartam — e as empresas mais precisam.</h2>
            <p>Profissionais 50+ acumulam o que não se ensina em treinamento: repertório de crises, rede de relacionamentos e julgamento apurado. Em vez de afastá-los do mercado, o MaringáPost os reconecta — no formato e no ritmo certos para esta fase.</p>
          </div>
          <ul className="sr-why-list">
            <li><Icon name="check" size={18} stroke={2.4} /> Repertório real de décadas, não teoria</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Disponibilidade flexível, sem vínculo CLT</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Transferência de conhecimento para times jovens</li>
            <li><Icon name="check" size={18} stroke={2.4} /> Rede de contatos construída ao longo da carreira</li>
          </ul>
        </div>
      </section>

      {/* Profissionais */}
      <section className="sr-pros-wrap">
        <div className="sr-wrap">
          <h2 className="sr-h2">Profissionais disponíveis</h2>
          <div className="sr-pros">
            {SR_PROS.map((p) => <SrProCard key={p.id} pro={p} onInvite={(pro) => setAtivo(pro)} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sr-cta">
        <div className="sr-wrap sr-cta-inner">
          <div>
            <h2 className="sr-h2 light">Você construiu uma carreira. Ela ainda tem muito a entregar.</h2>
            <p>Cadastre sua trajetória e escolha como quer colaborar — mentoria, conselho, projetos ou treinamentos. No seu tempo, no seu valor.</p>
          </div>
          <button className="sr-btn light big" onClick={() => go("cadastro-candidato")}><Icon name="arrow" size={17} stroke={2} /> Entrar no banco de talentos</button>
        </div>
      </section>

      {ativo && <SrInviteModal pro={ativo} onClose={() => setAtivo(null)} />}
    </div>
  );
}

Object.assign(window, { SeniorScreen });
