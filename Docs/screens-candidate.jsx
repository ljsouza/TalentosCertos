// screens-candidate.jsx — cadastro (currículo PDF/LinkedIn + Teste IA) + painel
const { useState: useStateC } = React;

// Máscara de celular BR: (44) 9 9999-9999
function maskFone(v) {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  let out = "(" + d.slice(0, 2);
  if (d.length < 2) return out;
  out += ") ";
  if (d.length <= 6) { out += d.slice(2); return out; }
  if (d.length <= 10) { out += d.slice(2, 6) + "-" + d.slice(6); return out; }
  out += d.slice(2, 3) + " " + d.slice(3, 7) + "-" + d.slice(7);
  return out;
}

const ARQ = {
  lider: { nome: "Líder-Mobilizador", desc: "Inspira o time e assume a frente nas decisões." },
  analitico: { nome: "Analítico-Estratégico", desc: "Decide com dados e enxerga padrões antes dos outros." },
  executor: { nome: "Executor-Consistente", desc: "Transforma o plano em entrega, com foco e disciplina." },
  colaborativo: { nome: "Colaborador-Empático", desc: "Constrói pontes e mantém o time coeso." },
};
const Q_PAPEL = [
  { k: "lider", t: "Liderar e mobilizar" },
  { k: "analitico", t: "Analisar e estruturar" },
  { k: "executor", t: "Executar e entregar" },
  { k: "colaborativo", t: "Conectar pessoas" },
];
const HARD = ["Excel", "SQL", "Power BI", "Python", "Pacote Office", "Atendimento", "Vendas", "Gestão de projetos", "Inglês", "Marketing"];
const SOFT = ["Comunicação", "Liderança", "Organização", "Proatividade", "Resiliência", "Criatividade", "Negociação"];

// ---------- Teste de IA ----------
function AITest({ onComplete }) {
  const [papel, setPapel] = useStateC(null);
  const [decisao, setDecisao] = useStateC(null);
  const [hard, setHard] = useStateC([]);
  const [soft, setSoft] = useStateC([]);
  const [analyzing, setAnalyzing] = useStateC(false);
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const ready = papel && decisao && hard.length >= 2 && soft.length >= 1;
  const run = () => {
    setAnalyzing(true);
    setTimeout(() => {
      onComplete({ archetype: { key: papel, ...ARQ[papel] }, hard, soft: soft.slice(0, 4), readiness: 100 });
    }, 2200);
  };

  if (analyzing) return (
    <div className="ai-analyzing">
      <div className="ai-orb"><span /><span /><span /></div>
      <h2>A IA está montando seu perfil…</h2>
      <p>Cruzando suas respostas, habilidades e currículo para encontrar as vagas mais compatíveis.</p>
    </div>
  );

  return (
    <div className="ai-test">
      <div className="ai-test-head">
        <span className="ai-badge"><Icon name="bolt" size={14} /> Teste de perfil · IA</span>
        <h1>Vamos entender como você trabalha</h1>
        <p className="form-sub">2 minutos. Usamos isso para indicar você às vagas mais compatíveis — e para empresas te encontrarem.</p>
      </div>

      <div className="ai-q">
        <label className="ai-q-label">No trabalho, seu papel natural é…</label>
        <div className="ai-opts grid-2">
          {Q_PAPEL.map((o) => (
            <button key={o.k} type="button" className={`ai-opt ${papel === o.k ? "on" : ""}`} onClick={() => setPapel(o.k)}>{o.t}</button>
          ))}
        </div>
      </div>
      <div className="ai-q">
        <label className="ai-q-label">Como você costuma decidir?</label>
        <div className="ai-opts">
          {["Com dados e fatos", "Pela experiência e intuição", "Ouvindo o time"].map((o) => (
            <button key={o} type="button" className={`ai-opt ${decisao === o ? "on" : ""}`} onClick={() => setDecisao(o)}>{o}</button>
          ))}
        </div>
      </div>
      <div className="ai-q">
        <label className="ai-q-label">Suas habilidades técnicas <i>(selecione ao menos 2)</i></label>
        <div className="chip-pick">
          {HARD.map((s) => <button key={s} type="button" className={`pick ${hard.includes(s) ? "on" : ""}`} onClick={() => toggle(hard, setHard, s)}>{s}</button>)}
        </div>
      </div>
      <div className="ai-q">
        <label className="ai-q-label">E seus pontos fortes de comportamento</label>
        <div className="chip-pick">
          {SOFT.map((s) => <button key={s} type="button" className={`pick ${soft.includes(s) ? "on" : ""}`} onClick={() => toggle(soft, setSoft, s)}>{s}</button>)}
        </div>
      </div>
      <Btn full icon="bolt" onClick={run} >{ready ? "Analisar meu perfil com IA" : "Responda as perguntas acima"}</Btn>
      {!ready && <span className="ai-hint">Escolha o papel, a forma de decidir, 2+ habilidades e 1+ ponto forte.</span>}
    </div>
  );
}

function CadastroCandidato({ go }) {
  const [mode, setMode] = useStateC("cadastro"); // 'login' | 'cadastro'
  const [step, setStep] = useStateC(1);
  const [file, setFile] = useStateC(null);
  const [drag, setDrag] = useStateC(false);
  const [src, setSrc] = useStateC(null); // 'pdf' | 'linkedin'
  const [linkedinOk, setLinkedinOk] = useStateC(false);
  const [profile, setProfile] = useStateC(null);
  const [nome, setNome] = useStateC("");
  const [telefone, setTelefone] = useStateC("");
  const onFile = (f) => { if (f) { setFile({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB" }); setSrc("pdf"); } };
  const finishAI = (p) => { const full = { ...p, nome: nome || "Candidato(a)", telefone }; setProfile(full); try { localStorage.setItem("mp_candidate", JSON.stringify(full)); } catch {} setStep(4); };
  const curriculoOk = (src === "pdf" && file) || (src === "linkedin" && linkedinOk);

  return (
    <div className="screen auth">
      <div className="auth-split">
        <div className="auth-aside cand">
          <Logo size={20} onClick={() => go("home")} />
          <div className="auth-aside-body">
            <span className="chapeu light">Área do candidato</span>
            <h2>Um cadastro. Candidatura em um clique para todas as vagas.</h2>
            <ul className="auth-points">
              <li><Icon name="check" size={16} stroke={2.4} /> Currículo vinculado automaticamente a cada vaga</li>
              <li><Icon name="check" size={16} stroke={2.4} /> Importe do LinkedIn ou anexe seu PDF</li>
              <li><Icon name="check" size={16} stroke={2.4} /> Teste de IA que te coloca na frente nas vagas certas</li>
            </ul>
          </div>
          <span className="auth-foot">Grátis, sempre. · Independente, sempre.</span>
        </div>

        <div className="auth-form">
          <div className="auth-toggle" style={{marginBottom:24}}>
            <button className={mode === "cadastro" ? "on" : ""} onClick={() => setMode("cadastro")}>Criar conta</button>
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Entrar</button>
          </div>

          {mode === "login" && (
            <form className="form" onSubmit={(e) => { e.preventDefault(); go("painel-candidato"); }}>
              <h1>Acesse sua conta</h1>
              <p className="form-sub">Bem-vindo de volta! Entre para ver suas vagas.</p>
              <Field label="E-mail" required><input type="email" required placeholder="seu@email.com" /></Field>
              <Field label="Senha" required><input type="password" required placeholder="••••••••" /></Field>
              <button type="button" className="link forgot">Esqueci minha senha</button>
              <Btn full type="submit" icon="arrow">Entrar</Btn>
              <p className="form-foot">Não tem conta? <button type="button" className="link" onClick={() => setMode("cadastro")}>Cadastre-se grátis</button></p>
            </form>
          )}

          {mode === "cadastro" && (
          <React.Fragment>
          <div className="steps">
            {["Dados", "Currículo", "Perfil IA", "Pronto"].map((s, i) => (
              <span key={s} className={`step ${step === i + 1 ? "on" : ""} ${step > i + 1 ? "done" : ""}`}>
                <b>{step > i + 1 ? "✓" : i + 1}</b>{s}
              </span>
            ))}
          </div>

          {step === 1 && (
            <form className="form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <h1>Seus dados básicos</h1>
              <p className="form-sub">Leva menos de um minuto.</p>
              <div className="grid-2">
                <Field label="Nome completo" required><input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ana Maria da Silva" /></Field>
                <Field label="Telefone / WhatsApp" required><input required value={telefone} onChange={(e) => setTelefone(maskFone(e.target.value))} placeholder="(44) 9 9999-9999" inputMode="tel" /></Field>
                <Field label="E-mail" required><input type="email" required placeholder="voce@email.com" /></Field>
                <Field label="Cidade"><select>{window.CIDADES.map((c) => <option key={c}>{c}</option>)}</select></Field>
              </div>
              <Field label="Área de interesse"><select>{window.AREAS.map((a) => <option key={a}>{a}</option>)}</select></Field>
              <Btn full type="submit" icon="arrow">Continuar</Btn>
              <p className="form-foot">Já tem conta? <button type="button" className="link" onClick={() => setMode("login")}>Entrar</button></p>
            </form>
          )}

          {step === 2 && (
            <div className="form">
              <h1>Seu currículo</h1>
              <p className="form-sub">Ele fica salvo e é <strong>anexado automaticamente</strong> a toda vaga que você se candidatar. Escolha a fonte:</p>
              <div className="src-cards">
                <button type="button" className={`src-card ${src === "linkedin" ? "on" : ""}`} onClick={() => setSrc("linkedin")}>
                  <span className="src-ic li"><Icon name="users" size={20} /></span>
                  <strong>Importar do LinkedIn</strong>
                  <span>Puxamos sua experiência e formação</span>
                </button>
                <button type="button" className={`src-card ${src === "pdf" ? "on" : ""}`} onClick={() => setSrc("pdf")}>
                  <span className="src-ic"><Icon name="doc" size={20} /></span>
                  <strong>Anexar PDF</strong>
                  <span>Use o currículo que você já tem</span>
                </button>
              </div>

              {src === "linkedin" && (
                <div className="src-panel">
                  {linkedinOk ? (
                    <div className="li-imported">
                      <Icon name="check" size={20} stroke={2.4} style={{ color: "var(--accent)" }} />
                      <div><strong>Perfil importado do LinkedIn</strong><span>Ana Maria da Silva · Analista de Dados · 4 experiências, 2 formações</span></div>
                    </div>
                  ) : (
                    <div className="li-row">
                      <div className="sb-field grow li-field"><Icon name="users" size={18} /><input placeholder="linkedin.com/in/seu-perfil" /></div>
                      <Btn onClick={() => setLinkedinOk(true)}>Importar</Btn>
                    </div>
                  )}
                </div>
              )}

              {src === "pdf" && (
                <label className={`dropzone ${drag ? "drag" : ""} ${file ? "has" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}>
                  <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => onFile(e.target.files[0])} />
                  {file ? (
                    <div className="file-on"><Icon name="doc" size={28} /><div><strong>{file.name}</strong><span>{file.size} · anexado</span></div><Icon name="check" size={20} stroke={2.4} style={{ color: "var(--accent)" }} /></div>
                  ) : (
                    <div className="drop-empty"><Icon name="upload" size={30} /><strong>Arraste seu currículo aqui</strong><span>PDF, DOC ou DOCX até 5 MB</span></div>
                  )}
                </label>
              )}

              <div className="form-actions">
                <Btn variant="ghost" onClick={() => setStep(1)}>Voltar</Btn>
                <Btn icon="arrow" onClick={() => curriculoOk && setStep(3)}>{curriculoOk ? "Continuar" : "Escolha uma fonte"}</Btn>
              </div>
            </div>
          )}

          {step === 3 && <AITest onComplete={finishAI} />}

          {step === 4 && profile && (
            <div className="form done-form">
              <div className="done-mark"><Icon name="bolt" size={32} stroke={2} /></div>
              <h1>Seu perfil de IA está pronto!</h1>
              <div className="ai-result">
                <span className="chapeu">Perfil comportamental</span>
                <h3 className="ai-arch">{profile.archetype.nome}</h3>
                <p>{profile.archetype.desc}</p>
                <div className="ai-tags">
                  {profile.soft.map((s) => <span key={s} className="ai-tag soft">{s}</span>)}
                  {profile.hard.slice(0, 4).map((s) => <span key={s} className="ai-tag">{s}</span>)}
                </div>
                <div className="ai-src-note"><Icon name="doc" size={14} /> Currículo {src === "linkedin" ? "importado do LinkedIn" : "em PDF"} · vinculado às suas candidaturas</div>
              </div>
              <div className="done-actions">
                <Btn full icon="arrow" onClick={() => go("painel-candidato")}>Ver vagas compatíveis comigo</Btn>
                <Btn variant="dark" full icon="whatsapp" onClick={() => go("painel-candidato")}>Ativar radar no WhatsApp</Btn>
              </div>
            </div>
          )}
          </React.Fragment>
          )} {/* fim mode === "cadastro" */}
        </div>
      </div>
    </div>
  );
}

function RadarCard({ prof }) {
  const fonePerfil = prof?.telefone || "";
  const [ativo, setAtivo] = useStateC(() => { try { return localStorage.getItem("mp_radar") === "1"; } catch { return false; } });
  const [open, setOpen] = useStateC(false);
  const [fone, setFone] = useStateC(maskFone(fonePerfil));
  const [consent, setConsent] = useStateC(false);

  const foneValido = fone.replace(/\D/g, "").length >= 10;
  const ativar = () => {
    if (!foneValido || !consent) return;
    try { localStorage.setItem("mp_radar", "1"); localStorage.setItem("mp_radar_fone", fone); } catch {}
    setAtivo(true); setOpen(false);
  };
  const desativar = () => {
    try { localStorage.removeItem("mp_radar"); } catch {}
    setAtivo(false); setConsent(false);
  };

  if (ativo) {
    return (
      <div className="radar-panel on">
        <div className="radar-panel-head"><span className="radar-dot" /> <Icon name="bolt" size={16} /> Radar ativo</div>
        <p className="radar-panel-sub">Você recebe no WhatsApp <strong>{fone || maskFone(localStorage.getItem("mp_radar_fone")) || "seu número"}</strong> as vagas compatíveis assim que são publicadas.</p>
        <button className="radar-off" onClick={desativar}>Desativar radar</button>
      </div>
    );
  }

  return (
    <div className="radar-panel">
      <div className="radar-panel-head"><Icon name="bolt" size={16} /> Radar de vagas</div>
      <p className="radar-panel-sub">Receba por WhatsApp as vagas que combinam com seu perfil, assim que forem publicadas.</p>
      {!open ? (
        <button className="radar-activate" onClick={() => setOpen(true)}><Icon name="whatsapp" size={16} /> Ativar meu radar</button>
      ) : (
        <div className="radar-form">
          <label className="radar-field">
            <span>Número do WhatsApp</span>
            <input value={fone} onChange={(e) => setFone(maskFone(e.target.value))} placeholder="(44) 9 9999-9999" inputMode="tel" maxLength={16} />
            {fonePerfil && <small>Preenchido com o telefone do seu cadastro</small>}
          </label>
          <label className="radar-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              <strong>Consentimento (LGPD).</strong> Autorizo o MaringáPost a usar meu número de WhatsApp e os dados do meu perfil para me enviar alertas de vagas compatíveis. Sei que esse é o único uso, que meus dados não serão compartilhados com terceiros sem nova autorização, e que posso revogar este consentimento e solicitar a exclusão dos meus dados a qualquer momento — em conformidade com a Lei nº 13.709/2018 (LGPD).
            </span>
          </label>
          <button className="radar-activate" disabled={!foneValido || !consent} onClick={ativar}><Icon name="whatsapp" size={16} /> Confirmar e ativar</button>
        </div>
      )}
      <span className="radar-panel-note">Grátis para candidatos · cancele quando quiser</span>
    </div>
  );
}

function PainelCandidato({ go, saved, toggleSave }) {
  const { VAGAS } = window;
  const recs = [...VAGAS].sort((a, b) => b.match - a.match).slice(0, 3);
  const savedVagas = VAGAS.filter((v) => saved.includes(v.id));
  let prof = null;
  try { prof = JSON.parse(localStorage.getItem("mp_candidate") || "null"); } catch {}
  const arch = prof?.archetype?.nome || "Analítico-Estratégico";
  const archDesc = prof?.archetype?.desc || "Decide com dados e enxerga padrões antes dos outros.";
  const soft = prof?.soft || ["Comunicação", "Organização"];
  const hard = prof?.hard?.slice(0, 4) || ["SQL", "Excel", "Power BI"];

  return (
    <div className="screen panel">
      <div className="panel-head">
        <div>
          <span className="chapeu">Área do candidato</span>
          <h1>Olá, Ana 👋</h1>
        </div>
        <div className="panel-profile">
          <div className="prof-strength">
            <MatchRing value={72} size={50} />
            <div><strong>Perfil 72% completo</strong><span>Adicione experiências para subir</span></div>
          </div>
        </div>
      </div>

      <div className="ai-profile-card">
        <div className="apc-left">
          <span className="ai-badge"><Icon name="bolt" size={14} /> Seu perfil de IA</span>
          <h2>{arch}</h2>
          <p>{archDesc}</p>
          <div className="ai-tags">
            {soft.map((s) => <span key={s} className="ai-tag soft">{s}</span>)}
            {hard.map((s) => <span key={s} className="ai-tag">{s}</span>)}
          </div>
        </div>
        <div className="apc-right">
          <p>É assim que a IA do MaringáPost te coloca na frente nas vagas certas.</p>
          <button className="link" onClick={() => go("cadastro-candidato")}>Refazer teste de perfil</button>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi n="3" l="Candidaturas ativas" icon="bolt" />
        <Kpi n={savedVagas.length} l="Vagas salvas" icon="bookmark" />
        <Kpi n="2" l="Empresas viram seu perfil" icon="eye" />
        <Kpi n="9" l="Vagas no seu radar" icon="bolt" />
      </div>

      <div className="panel-cols">
        <section className="panel-col">
          <SectionHead chapeu="Recomendado pela IA" titulo="Vagas mais compatíveis com você" />
          <div className="job-grid regular">
            {recs.map((v) => <JobCard key={v.id} vaga={v} density="compact" onOpen={(id) => go("vaga", id)} onSave={toggleSave} saved={saved.includes(v.id)} />)}
          </div>
        </section>
        <aside className="panel-col narrow">
          <RadarCard prof={prof} />
          <ReadingProfileCard />
          <SectionHead titulo="Suas candidaturas" />
          <div className="apps">
            {[
              { v: "Analista de Dados Júnior", c: "Apitec", st: "Em análise", tone: "warn" },
              { v: "Estágio em Marketing", c: "Dengo", st: "Currículo visto", tone: "ok" },
              { v: "Vendedor(a) Externo", c: "Grupo Amigão", st: "Aguardando", tone: "" },
            ].map((a, i) => (
              <div key={i} className="app-row">
                <div><strong>{a.v}</strong><span>{a.c}</span></div>
                <span className={`app-st ${a.tone}`}>{a.st}</span>
              </div>
            ))}
          </div>
          {savedVagas.length > 0 && (
            <>
              <SectionHead titulo="Salvas" />
              <div className="apps">
                {savedVagas.map((v) => (
                  <button key={v.id} className="app-row link-row" onClick={() => go("vaga", v.id)}>
                    <div><strong>{v.titulo}</strong><span>{window.empById(v.empresa).nome}</span></div>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <i>*</i>}</span>
      {children}
    </label>
  );
}

function Kpi({ n, l, icon }) {
  return (
    <div className="kpi">
      <span className="kpi-icon"><Icon name={icon} size={18} /></span>
      <strong>{n}</strong>
      <span className="kpi-l">{l}</span>
    </div>
  );
}

Object.assign(window, { CadastroCandidato, PainelCandidato, Field, Kpi, AITest });
