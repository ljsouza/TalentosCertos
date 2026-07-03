// screens-express.jsx — "Na Hora": Uber de profissionais temporários
const { useState: useStateX } = React;

const EXP_CATS = [
  { id: "eventos", icon: "users", nome: "Eventos", desc: "Equipe completa para sua festa, feira ou congresso", disp: 34, hora: 28 },
  { id: "promotores", icon: "star", nome: "Promotores", desc: "Abordagem, panfletagem e ativação de marca", disp: 21, hora: 22 },
  { id: "recepcao", icon: "chat", nome: "Recepcionistas", desc: "Recepção, credenciamento e atendimento", disp: 18, hora: 25 },
  { id: "tecnicos", icon: "bolt", nome: "Técnicos", desc: "Som, luz, elétrica, montagem e manutenção", disp: 27, hora: 45 },
  { id: "freela", icon: "doc", nome: "Freelancers", desc: "Design, foto, social media e produção", disp: 42, hora: 60 },
];

const EXP_PROS = [
  { id: "p1", nome: "Marina Sales", cat: "recepcao", func: "Recepcionista bilíngue", nota: 4.9, jobs: 87, dist: 2.1, hora: 32, status: "agora", verif: true, tags: ["Inglês fluente", "Eventos corporativos"] },
  { id: "p2", nome: "Diego Antunes", cat: "tecnicos", func: "Técnico de som e luz", nota: 4.8, jobs: 134, dist: 3.6, hora: 55, status: "agora", verif: true, tags: ["PA / mesa digital", "Shows e igrejas"] },
  { id: "p3", nome: "Letícia Prado", cat: "promotores", func: "Promotora de vendas", nota: 5.0, jobs: 52, dist: 1.4, hora: 26, status: "agora", verif: true, tags: ["Abordagem ativa", "Supermercados"] },
  { id: "p4", nome: "Carlos Eduardo", cat: "eventos", func: "Garçom & buffet", nota: 4.7, jobs: 168, dist: 4.2, hora: 24, status: "2h", verif: true, tags: ["Serviço à francesa", "Eventos sociais"] },
  { id: "p5", nome: "Bruna Cardoso", cat: "freela", func: "Social media & foto", nota: 4.9, jobs: 41, dist: 2.8, hora: 70, status: "agora", verif: true, tags: ["Cobertura ao vivo", "Reels & stories"] },
  { id: "p6", nome: "Felipe Moraes", cat: "eventos", func: "Auxiliar de montagem", nota: 4.6, jobs: 95, dist: 5.0, hora: 22, status: "agora", verif: false, tags: ["Estandes & feiras", "Carga e descarga"] },
  { id: "p7", nome: "Aline Ferreira", cat: "recepcao", func: "Hostess & credenciamento", nota: 4.9, jobs: 73, dist: 3.1, hora: 30, status: "3h", verif: true, tags: ["Lista VIP", "Atendimento premium"] },
  { id: "p8", nome: "Rodrigo Lima", cat: "tecnicos", func: "Eletricista de eventos", nota: 4.8, jobs: 112, dist: 6.3, hora: 48, status: "agora", verif: true, tags: ["NR-10", "Geradores"] },
];

function expIniciais(n) { return n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase(); }
function expStatusLabel(s) { return s === "agora" ? "Livre agora" : `Livre em ${s}`; }

// ---- Modal de solicitação (estilo "chamar corrida") ----
function ExpRequestModal({ pro, onClose }) {
  const [fase, setFase] = useStateX("form"); // form | buscando | enviado
  const [horas, setHoras] = useStateX(4);
  const [quando, setQuando] = useStateX("hoje");
  const total = pro.hora * horas;

  const chamar = () => {
    setFase("buscando");
    setTimeout(() => setFase("enviado"), 2200);
  };

  return (
    <div className="exp-modal" onClick={onClose}>
      <div className="exp-card" onClick={(e) => e.stopPropagation()}>
        {fase === "form" && (
          <>
            <div className="exp-card-head">
              <div className="exp-ava lg">{expIniciais(pro.nome)}</div>
              <div className="exp-card-id">
                <strong>{pro.nome} {pro.verif && <span className="exp-vchk" title="Verificado"><Icon name="check" size={11} stroke={3} /></span>}</strong>
                <span>{pro.func}</span>
                <span className="exp-card-rate"><Icon name="star" size={13} stroke={0} style={{ fill: "var(--accent-2)" }} /> {pro.nota.toFixed(1)} · {pro.jobs} trabalhos · {pro.dist} km</span>
              </div>
              <button className="exp-x" onClick={onClose} aria-label="Fechar">×</button>
            </div>
            <div className="exp-form">
              <label className="exp-field">
                <span>Quando você precisa?</span>
                <div className="exp-seg">
                  {[["hoje", "Hoje"], ["amanha", "Amanhã"], ["data", "Escolher data"]].map(([v, l]) => (
                    <button key={v} className={quando === v ? "on" : ""} onClick={() => setQuando(v)}>{l}</button>
                  ))}
                </div>
              </label>
              <label className="exp-field">
                <span>Por quantas horas? <strong>{horas}h</strong></span>
                <input type="range" min="2" max="12" value={horas} onChange={(e) => setHoras(+e.target.value)} className="exp-range" />
                <div className="exp-range-scale"><span>2h</span><span>12h</span></div>
              </label>
              <div className="exp-total">
                <div><span>Valor estimado</span><small>{pro.hora} R$/h × {horas}h · pagamento seguro pela plataforma</small></div>
                <strong>R$ {total.toLocaleString("pt-BR")}</strong>
              </div>
            </div>
            <button className="exp-call-btn big" onClick={chamar}><Icon name="bolt" size={18} stroke={2} /> Chamar {pro.nome.split(" ")[0]} agora</button>
            <p className="exp-fine">Sem custo até o profissional aceitar. Você confirma antes de fechar.</p>
          </>
        )}
        {fase === "buscando" && (
          <div className="exp-searching">
            <div className="exp-radar"><span /><span /><span /><div className="exp-radar-ava">{expIniciais(pro.nome)}</div></div>
            <h3>Enviando para {pro.nome.split(" ")[0]}…</h3>
            <p>Notificando o profissional e confirmando disponibilidade na sua região.</p>
          </div>
        )}
        {fase === "enviado" && (
          <div className="exp-done">
            <div className="exp-done-check"><Icon name="check" size={34} stroke={2.6} /></div>
            <h3>Solicitação enviada!</h3>
            <p><strong>{pro.nome}</strong> foi notificado(a) e costuma responder em <strong>poucos minutos</strong>. Você receberá a confirmação por WhatsApp e poderá acompanhar tudo por aqui.</p>
            <div className="exp-done-acts">
              <button className="exp-call-btn ghost" onClick={onClose}>Fechar</button>
              <button className="exp-call-btn" onClick={onClose}><Icon name="chat" size={16} /> Abrir conversa</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpProCard({ pro, onCall }) {
  return (
    <article className="exp-pro">
      <div className="exp-pro-top">
        <div className="exp-ava">{expIniciais(pro.nome)}</div>
        <div className="exp-pro-id">
          <strong>{pro.nome} {pro.verif && <span className="exp-vchk" title="Profissional verificado"><Icon name="check" size={10} stroke={3} /></span>}</strong>
          <span>{pro.func}</span>
        </div>
        <span className={`exp-status ${pro.status === "agora" ? "now" : ""}`}><span className="exp-dot" />{expStatusLabel(pro.status)}</span>
      </div>
      <div className="exp-pro-meta">
        <span><Icon name="star" size={14} stroke={0} style={{ fill: "var(--accent-2)" }} /> {pro.nota.toFixed(1)} <i>({pro.jobs})</i></span>
        <span><Icon name="pin" size={14} /> {pro.dist} km</span>
        <span className="exp-pro-rate">R$ {pro.hora}<i>/h</i></span>
      </div>
      <div className="exp-pro-tags">
        {pro.tags.map((t) => <span key={t}>{t}</span>)}
      </div>
      <button className="exp-call-btn" onClick={() => onCall(pro)}><Icon name="bolt" size={15} stroke={2} /> Chamar agora</button>
    </article>
  );
}

function ExpressScreen({ go }) {
  const [cat, setCat] = useStateX("todos");
  const [ativo, setAtivo] = useStateX(null);
  const totalDisp = EXP_PROS.filter((p) => p.status === "agora").length + 78;
  const lista = cat === "todos" ? EXP_PROS : EXP_PROS.filter((p) => p.cat === cat);

  return (
    <div className="screen exp-screen">
      {/* Hero */}
      <section className="exp-hero">
        <div className="exp-hero-inner">
          <span className="exp-tag"><Icon name="flame" size={14} stroke={2} /> MaringáPost Na Hora</span>
          <h1>Precisa de gente <em>hoje</em>?<br />Contrate em horas, não em semanas.</h1>
          <p>Profissionais temporários verificados, disponíveis perto de você. Para eventos, picos de demanda e urgências — do promotor ao técnico de som.</p>
          <div className="exp-live"><span className="exp-live-dot" /> <strong>{totalDisp} profissionais</strong> disponíveis agora em Maringá · resposta média <strong>12 min</strong></div>
          <div className="exp-hero-acts">
            <button className="exp-call-btn big" onClick={() => { document.querySelector(".exp-pros-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon name="bolt" size={18} stroke={2} /> Encontrar profissionais</button>
            <button className="exp-ghost-btn" onClick={() => document.querySelector(".exp-how")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Como funciona</button>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="exp-cats-sec">
        <div className="exp-wrap">
          <h2 className="exp-h2">O que você precisa contratar?</h2>
          <div className="exp-cats">
            {EXP_CATS.map((c) => (
              <button key={c.id} className={`exp-cat ${cat === c.id ? "on" : ""}`} onClick={() => { setCat(c.id); document.querySelector(".exp-pros-wrap")?.scrollIntoView({ behavior: "smooth" }); }}>
                <div className="exp-cat-ic"><Icon name={c.icon} size={22} /></div>
                <strong>{c.nome}</strong>
                <p>{c.desc}</p>
                <span className="exp-cat-foot"><b>{c.disp}</b> disponíveis · a partir de <b>R$ {c.hora}/h</b></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="exp-how">
        <div className="exp-wrap">
          <h2 className="exp-h2 light">Da necessidade ao profissional em 3 passos</h2>
          <div className="exp-steps">
            {[
              { n: "1", t: "Descreva a demanda", d: "Escolha a função, quando precisa e por quantas horas. Leva menos de um minuto." },
              { n: "2", t: "Receba quem está livre", d: "Mostramos profissionais verificados, avaliados e próximos de você — disponíveis na hora." },
              { n: "3", t: "Confirme e contrate", d: "Chame com um toque, combine os detalhes no chat e pague com segurança pela plataforma." },
            ].map((s) => (
              <div key={s.n} className="exp-step"><span className="exp-step-n">{s.n}</span><strong>{s.t}</strong><p>{s.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Disponíveis agora */}
      <section className="exp-pros-wrap">
        <div className="exp-wrap">
          <div className="exp-pros-head">
            <h2 className="exp-h2">Disponíveis {cat === "todos" ? "agora" : "· " + (EXP_CATS.find((c) => c.id === cat)?.nome || "")}</h2>
            <div className="exp-filter">
              <button className={cat === "todos" ? "on" : ""} onClick={() => setCat("todos")}>Todos</button>
              {EXP_CATS.map((c) => <button key={c.id} className={cat === c.id ? "on" : ""} onClick={() => setCat(c.id)}>{c.nome}</button>)}
            </div>
          </div>
          <div className="exp-pros">
            {lista.map((p) => <ExpProCard key={p.id} pro={p} onCall={(pro) => setAtivo({ pro })} />)}
          </div>
        </div>
      </section>

      {/* CTA profissional */}
      <section className="exp-cta-pro">
        <div className="exp-wrap exp-cta-inner">
          <div>
            <span className="chapeu">Para profissionais</span>
            <h2 className="exp-h2 light">Tem tempo livre? Receba trabalhos perto de você.</h2>
            <p>Cadastre suas habilidades, defina seu valor por hora e fique disponível quando quiser. Sem mensalidade — você só é chamado quando há trabalho.</p>
          </div>
          <button className="exp-call-btn big light" onClick={() => go("cadastro-candidato")}><Icon name="arrow" size={17} stroke={2} /> Quero receber trabalhos</button>
        </div>
      </section>

      {ativo && <ExpRequestModal pro={ativo.pro} onClose={() => setAtivo(null)} />}
    </div>
  );
}

Object.assign(window, { ExpressScreen });
