// screens-admin.jsx — Admin: dashboard, aprovações, empresas, conteúdo, pacotes
const { useState: useStateAd } = React;

/* ── mock de empresas aguardando aprovação ── */
const EMP_PEND_SEED = [
  { id:'ep1', nome:'Construtora Norte PR',  setor:'Construção Civil',  cnpj:'12.345.678/0001-99', responsavel:'Carlos Menezes',    email:'rh@nortepr.com.br',           tel:'(44) 99801-2345', dt:'14 jun 2026', pacote:'Conectar'   },
  { id:'ep2', nome:'Clínica Saúde Total',   setor:'Saúde',             cnpj:'98.765.432/0001-11', responsavel:'Dra. Fernanda Luz',  email:'admin@saudetotal.com.br',      tel:'(44) 3222-9900',  dt:'13 jun 2026', pacote:'Atrair'     },
  { id:'ep3', nome:'TechFlow Soluções',     setor:'Tecnologia / TI',   cnpj:'45.678.901/0001-55', responsavel:'Lucas Braga',        email:'lucas@techflow.io',            tel:'(44) 98765-4321', dt:'12 jun 2026', pacote:'CrescerPro' },
];

/* ── mock de usuários aguardando vínculo/aprovação ── */
const USR_PEND_SEED = [
  { id:'up1', nome:'Marina Costa',  email:'marina@grupoamigao.com.br',       emp:'Grupo Amigão',        cargo:'Gerente de RH',      dt:'15 jun 2026' },
  { id:'up2', nome:'Roberto Sena',  email:'roberto@apitec.com.br',           emp:'Apitec Engenharia',   cargo:'Coordenador de RH',  dt:'14 jun 2026' },
  { id:'up3', nome:'Camila Dutra',  email:'camila@construtoranortepr.com.br', emp:'Construtora Norte PR',cargo:'Analista de RH',     dt:'14 jun 2026' },
];

const PLANOS_AD = ['Atrair','Conectar','CrescerPro'];
const SETORES_AD = ['Administrativo','Saúde','Tecnologia / TI','Comércio / Varejo','Indústria / Produção','Construção Civil','Gastronomia','Logística','Educação','Energia renovável','Financeiro','Outros'];

const PLAN_INIT = { e1:'CrescerPro', e2:'Conectar', e3:'Conectar', e4:'Atrair', e5:'Atrair', e6:'CrescerPro', e7:'Conectar' };
const PLAN_COLORS = { 'Atrair':'#1a4dcc', 'Conectar':'var(--accent)', 'CrescerPro':'var(--accent-2)' };
const PLAN_CLS   = { 'Atrair':'adm-pp-0', 'Conectar':'adm-pp-1', 'CrescerPro':'adm-pp-2' };

const FEATURE_GROUPS = [
  { group:'Publicação de vagas', items:[
    { id:'pub_basic',  label:'Publicação de vagas',               def:[true,  true,  true ] },
    { id:'pub_limite', label:'Limite mensal de vagas (3 / 12 / ∞)',def:[true,  true,  true ] },
    { id:'pub_dest',   label:'Vagas em destaque (até 4)',          def:[false, true,  true ] },
    { id:'pub_amp',    label:'Vaga Amplificada (multi-canal)',      def:[false, true,  true ] },
    { id:'pub_ilimit', label:'Vagas ilimitadas',                   def:[false, false, true ] },
  ]},
  { group:'Candidatos & IA', items:[
    { id:'ai_compat',  label:'Índice de compatibilidade IA',       def:[true,  true,  true ] },
    { id:'ai_arf',     label:'Filtro de Resposta Ativa (ARF)',     def:[false, true,  true ] },
    { id:'ai_radar',   label:'Radar de talentos',                  def:[false, true,  true ] },
    { id:'ai_intent',  label:'Score de intencionalidade',          def:[false, false, true ] },
    { id:'ai_relat',   label:'Relatórios avançados',               def:[false, true,  true ] },
  ]},
  { group:'Marca & Conteúdo', items:[
    { id:'marca_logo', label:'Logo no perfil da empresa',          def:[true,  true,  true ] },
    { id:'marca_pag',  label:'Página institucional completa',      def:[false, true,  true ] },
    { id:'marca_pub',  label:'Publicação editorial (1/trimestre)', def:[false, true,  true ] },
    { id:'marca_camp', label:'Campanha editorial MaringáPost',     def:[false, false, true ] },
    { id:'marca_verif',label:'Selo Empresa Verificada',            def:[false, true,  true ] },
  ]},
  { group:'Suporte & Integrações', items:[
    { id:'sup_email',  label:'Suporte por e-mail',                 def:[true,  true,  true ] },
    { id:'sup_prio',   label:'Suporte prioritário',                def:[false, true,  true ] },
    { id:'sup_ger',    label:'Gerente de conta dedicado',          def:[false, false, true ] },
    { id:'sup_ats',    label:'Integração com ATS',                 def:[false, false, true ] },
    { id:'sup_api',    label:'API de vagas',                       def:[false, false, true ] },
  ]},
];
function initFeatures() {
  const f={};
  FEATURE_GROUPS.forEach(g=>g.items.forEach(it=>{f[it.id]=[...it.def];}));
  return f;
}

const BLANK_EMP = { nome:'', cnpj:'', setor:'Saúde', cidade:'Maringá', endereco:'', site:'', fundada:'', funcionarios:'', responsavel:'', email:'', tel:'', pacote:'Atrair', sobre:'', sobreLongo:'', dest1:'', dest2:'', dest3:'', logoUrl:'' };

function AdminScreen({ go, pubs, approvePub, rejectPub }) {
  const [tab,        setTab]        = useStateAd('dashboard');
  const [rejectId,   setRejectId]   = useStateAd(null);
  const [motivo,     setMotivo]     = useStateAd('');
  const [userStatus, setUserStatus] = useStateAd({});
  const [userPlan,   setUserPlan]   = useStateAd(PLAN_INIT);
  const [verifiedOv, setVerifiedOv] = useStateAd({});
  const [features,   setFeatures]   = useStateAd(initFeatures);
  const [featSaved,  setFeatSaved]  = useStateAd(false);
  const [contFiltro, setContFiltro] = useStateAd('todos');
  // aprovações
  const [empPend,    setEmpPend]    = useStateAd(EMP_PEND_SEED);
  const [usrPend,    setUsrPend]    = useStateAd(USR_PEND_SEED);
  const [showCadEmp, setShowCadEmp] = useStateAd(false);
  const [cadEmp,     setCadEmp]     = useStateAd(BLANK_EMP);
  const [showCadEmpFull, setShowCadEmpFull] = useStateAd(false);
  const [cadEmpFull,     setCadEmpFull]     = useStateAd(BLANK_EMP);
  const [logoDrag,       setLogoDrag]       = useStateAd(false);
  const [empAprovPacote, setEmpAprovPacote] = useStateAd({});

  const empresas  = window.EMPRESAS;
  const pendentes = pubs.filter(p=>p.status==='pendente');
  const totalPend = empPend.length + usrPend.length;

  const getStatus   = id => userStatus[id] || 'ativa';
  const isVerified   = e  => verifiedOv[e.id]!==undefined ? verifiedOv[e.id] : e.verificada;
  const planVerifica = p  => p === 'Conectar' || p === 'CrescerPro';
  const toggleBlock  = id => setUserStatus(s=>({...s,[id]:s[id]==='bloqueada'?'ativa':'bloqueada'}));
  const toggleVerify = id => setVerifiedOv(v=>({...v,[id]:!isVerified({id})}));

  // Ao alterar plano: auto-verifica (Conectar/CrescerPro) ou revoga (Atrair)
  const changePlan = (id, newPlan) => {
    setUserPlan(s=>({...s,[id]:newPlan}));
    if(planVerifica(newPlan)) {
      setVerifiedOv(v=>({...v,[id]:true}));
    } else {
      setVerifiedOv(v=>({...v,[id]:false}));
    }
  };
  const toggleFeat = (itemId,i) => { setFeatures(f=>({...f,[itemId]:f[itemId].map((v,j)=>j===i?!v:v)})); setFeatSaved(false); };
  const handleReject = () => { if(rejectId&&motivo.trim()){rejectPub(rejectId,motivo.trim());setRejectId(null);setMotivo('');} };

  // Aprovar empresa: auto-verifica se plano elegível
  const aprovarEmp = id => {
    const emp = empPend.find(e=>e.id===id);
    const plano = empAprovPacote[id] || emp?.pacote || 'Atrair';
    if(emp && planVerifica(plano)) setVerifiedOv(v=>({...v,[emp.id]:true}));
    setEmpPend(p=>p.filter(e=>e.id!==id));
  };
  const rejeitarEmp = id => setEmpPend(p=>p.filter(e=>e.id!==id));
  const aprovarUsr = id => setUsrPend(p=>p.filter(u=>u.id!==id));
  const rejeitarUsr = id => setUsrPend(p=>p.filter(u=>u.id!==id));

  const submitCadEmp = () => {
    if(!cadEmp.nome||!cadEmp.cnpj||!cadEmp.email) return;
    setEmpPend(p=>[...p,{...cadEmp, id:'ep'+Date.now(), dt:'Hoje'}]);
    setCadEmp(BLANK_EMP); setShowCadEmp(false);
  };

  const submitCadEmpFull = () => {
    if(!cadEmpFull.nome||!cadEmpFull.cnpj||!cadEmpFull.email) return;
    setEmpPend(p=>[...p,{...cadEmpFull, id:'ep'+Date.now(), dt:'Hoje'}]);
    setCadEmpFull(BLANK_EMP); setShowCadEmpFull(false);
  };

  const handleLogoDrop = (ev, setter) => {
    ev.preventDefault(); setLogoDrag(false);
    const file = ev.dataTransfer?.files?.[0] || ev.target?.files?.[0];
    if(!file||!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => setter(d=>({...d, logoUrl:e.target.result}));
    reader.readAsDataURL(file);
  };

  const contFiltrada = contFiltro==='todos' ? pubs : pubs.filter(p=>p.status===contFiltro);

  const TABS = [
    { id:'dashboard', label:'Dashboard' },
    { id:'aprovacoes',label:'Aprovações', count: totalPend||null },
    { id:'empresas',  label:'Empresas',   count: empresas.length },
    { id:'conteudo',  label:'Conteúdo',   count: pendentes.length||null },
    { id:'pacotes',   label:'Pacotes / Recursos' },
  ];

  return (
    <div>
      <div className="admin-bar">
        <div className="admin-bar-inner">
          <span className="admin-role"><Icon name="shield" size={16}/> Administrador · MaringáPost</span>
          <button className="link" onClick={()=>go('home')}>← Voltar ao portal</button>
        </div>
      </div>

      <div className="screen panel admin">
        <div className="panel-head">
          <div>
            <span className="chapeu">Plataforma MaringáPost Empregos</span>
            <h1>Painel Administrativo</h1>
          </div>
        </div>

        <div className="panel-tabs">
          {TABS.map(t=>(
            <button key={t.id} className={tab===t.id?'on':''} onClick={()=>setTab(t.id)}>
              {t.label}{t.count?<span className="tab-count">{t.count}</span>:null}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && (
          <div>
            <div className="kpi-row">
              <Kpi n={empresas.length}    l="Empresas ativas"       icon="users"  />
              <Kpi n={window.VAGAS.length} l="Vagas publicadas"     icon="doc"    />
              <Kpi n={pendentes.length}   l="Conteúdos pendentes"   icon="clock"  />
              <Kpi n="R$ 14.280"          l="MRR estimado"          icon="chart"  />
            </div>
            {totalPend > 0 && (
              <div className="alerta-venc" style={{marginBottom:24}}>
                <div className="av-icon"><Icon name="clock" size={22}/></div>
                <div className="av-body">
                  <strong>Aprovações pendentes</strong>
                  <p>{empPend.length > 0 && `${empPend.length} empresa(s) aguardando aprovação. `}{usrPend.length > 0 && `${usrPend.length} usuário(s) aguardando vínculo.`}</p>
                  <div className="av-vagas">
                    <button className="av-item" onClick={()=>setTab('aprovacoes')}>
                      <Icon name="users" size={14}/> Ver aprovações pendentes <span>Revisar →</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="adm-dash-grid">
              <div className="adm-card">
                <p className="adm-card-title">Distribuição por plano</p>
                {PLANOS_AD.map((p,i)=>{
                  const n=Object.values(userPlan).filter(v=>v===p).length;
                  return (
                    <div key={p} className="adm-dist-row">
                      <span className={`adm-plan-pip adm-pp-${i}`}>{p}</span>
                      <div className="adm-dist-bar"><span className={`adm-bar-fill-${i}`} style={{width:`${n/empresas.length*100}%`}}/></div>
                      <span className="adm-dist-n">{n} empresa{n!==1?'s':''}</span>
                    </div>
                  );
                })}
              </div>
              <div className="adm-card">
                <p className="adm-card-title">Conteúdo recente</p>
                {pubs.slice(0,5).map(p=>(
                  <div key={p.id} className="adm-cont-row">
                    <span className={`pub-st ${p.status==='aprovada'?'ok':p.status==='reprovada'?'bad':'warn'}`}>{p.status}</span>
                    <span className="adm-cont-title" title={p.titulo}>{p.titulo}</span>
                  </div>
                ))}
                <button className="link" style={{fontSize:13,marginTop:10}} onClick={()=>setTab('conteudo')}>Ver todos →</button>
              </div>
              <div className="adm-card">
                <p className="adm-card-title">Vagas por modalidade</p>
                {['presencial','hibrido','remoto'].map(m=>{
                  const mod=window.MODALIDADES[m];
                  const n=window.VAGAS.filter(v=>v.modalidade===m).length;
                  return (
                    <div key={m} className="adm-dist-row">
                      <span className={`adm-plan-pip mod-badge mod-${m}`}>{mod?.label||m}</span>
                      <div className="adm-dist-bar"><span style={{width:`${n/window.VAGAS.length*100}%`,background:'var(--accent)'}}/></div>
                      <span className="adm-dist-n">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── APROVAÇÕES ── */}
        {tab==='aprovacoes' && (
          <div>
            {/* modal cadastro empresa */}
            {showCadEmp && (
              <div className="adm-modal-bg" onClick={()=>setShowCadEmp(false)}>
                <div className="adm-modal adm-modal-wide" onClick={e=>e.stopPropagation()}>
                  <h3>Cadastrar nova empresa</h3>
                  <p>Preencha os dados para adicionar a empresa à plataforma e vinculá-la ao pacote.</p>
                  <div className="adm-cad-grid">
                    <div className="field"><label className="field-label">Razão social *</label><input placeholder="Nome da empresa Ltda" value={cadEmp.nome} onChange={e=>setCadEmp(d=>({...d,nome:e.target.value}))} /></div>
                    <div className="field"><label className="field-label">CNPJ *</label><input placeholder="00.000.000/0001-00" value={cadEmp.cnpj} onChange={e=>setCadEmp(d=>({...d,cnpj:e.target.value}))} /></div>
                    <div className="field"><label className="field-label">Setor</label>
                      <select value={cadEmp.setor} onChange={e=>setCadEmp(d=>({...d,setor:e.target.value}))}>
                        {SETORES_AD.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="field"><label className="field-label">Responsável</label><input placeholder="Nome do contato" value={cadEmp.responsavel} onChange={e=>setCadEmp(d=>({...d,responsavel:e.target.value}))} /></div>
                    <div className="field"><label className="field-label">E-mail *</label><input type="email" placeholder="rh@empresa.com.br" value={cadEmp.email} onChange={e=>setCadEmp(d=>({...d,email:e.target.value}))} /></div>
                    <div className="field"><label className="field-label">Telefone</label><input placeholder="(44) 99000-0000" value={cadEmp.tel} onChange={e=>setCadEmp(d=>({...d,tel:e.target.value}))} /></div>
                  </div>
                  <div className="field" style={{marginTop:8}}>
                    <label className="field-label">Pacote contratado</label>
                    <div style={{display:'flex',gap:10,marginTop:6}}>
                      {PLANOS_AD.map((p,i)=>(
                        <button key={p} type="button"
                          className={`arf-fmt adm-pkg-btn-${i} ${cadEmp.pacote===p?'on':''}`}
                          onClick={()=>setCadEmp(d=>({...d,pacote:p}))}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="adm-modal-acts">
                    <Btn variant="ghost" onClick={()=>setShowCadEmp(false)}>Cancelar</Btn>
                    <Btn icon="check" onClick={submitCadEmp}>Cadastrar empresa</Btn>
                  </div>
                </div>
              </div>
            )}

            {/* empresas pendentes */}
            <div className="adm-aprov-head">
              <div>
                <h2>Empresas aguardando aprovação <span className="tab-count" style={{verticalAlign:'middle'}}>{empPend.length}</span></h2>
                <p>Verifique os dados, vincule ao pacote e aprove para liberar o acesso.</p>
              </div>
              <Btn icon="plus" onClick={()=>setShowCadEmp(true)}>Cadastrar empresa</Btn>
            </div>

            {empPend.length === 0
              ? <div className="adm-empty"><Icon name="check" size={22} stroke={2}/> Nenhuma empresa pendente.</div>
              : (
                <div className="adm-aprov-list">
                  {empPend.map(e=>(
                    <div key={e.id} className="adm-aprov-card">
                      <div className="adm-aprov-body">
                        <div className="adm-aprov-row">
                          <strong>{e.nome}</strong>
                          <span className={`prazo-badge prazo-warn`}>{e.setor}</span>
                        </div>
                        <div className="adm-aprov-meta">
                          <span><Icon name="shield" size={13}/> CNPJ: {e.cnpj}</span>
                          <span><Icon name="users"  size={13}/> {e.responsavel}</span>
                          <span><Icon name="clock"  size={13}/> {e.email}</span>
                          <span><Icon name="clock"  size={13}/> Solicitado em {e.dt}</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}>
                          <span style={{fontSize:13,fontWeight:600,color:'var(--ink-60)'}}>Pacote solicitado:</span>
                          <span className={`prazo-badge ${PLAN_CLS[e.pacote]?'':''}`} style={{background:`color-mix(in oklab,${PLAN_COLORS[e.pacote]||'var(--accent)'} 12%,#fff)`,color:PLAN_COLORS[e.pacote]||'var(--accent)'}}>{e.pacote}</span>
                          <select className="adm-plan-sel" style={{marginLeft:8}} value={empAprovPacote[e.id]||e.pacote} onChange={ev=>setEmpAprovPacote(s=>({...s,[e.id]:ev.target.value}))}>
                            {PLANOS_AD.map(p=><option key={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="adm-aprov-acts">
                        <Btn icon="check" onClick={()=>aprovarEmp(e.id)}>Aprovar</Btn>
                        <button className="btn btn-bad" onClick={()=>rejeitarEmp(e.id)}>Rejeitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            {/* usuários pendentes */}
            <div className="adm-aprov-head" style={{marginTop:36}}>
              <div>
                <h2>Usuários aguardando vínculo <span className="tab-count" style={{verticalAlign:'middle'}}>{usrPend.length}</span></h2>
                <p>Confirme o vínculo do usuário com a empresa antes de liberar o acesso.</p>
              </div>
            </div>

            {usrPend.length === 0
              ? <div className="adm-empty"><Icon name="check" size={22} stroke={2}/> Nenhum usuário pendente.</div>
              : (
                <div className="adm-aprov-list">
                  {usrPend.map(u=>(
                    <div key={u.id} className="adm-aprov-card">
                      <div className="adm-aprov-body">
                        <div className="adm-aprov-row">
                          <strong>{u.nome}</strong>
                          <span className="prazo-badge prazo-ok">Usuário</span>
                        </div>
                        <div className="adm-aprov-meta">
                          <span><Icon name="clock" size={13}/> {u.email}</span>
                          <span><Icon name="users" size={13}/> {u.emp}</span>
                          <span><Icon name="doc"   size={13}/> {u.cargo}</span>
                          <span><Icon name="clock" size={13}/> Solicitado em {u.dt}</span>
                        </div>
                      </div>
                      <div className="adm-aprov-acts">
                        <Btn icon="check" onClick={()=>aprovarUsr(u.id)}>Aprovar vínculo</Btn>
                        <button className="btn btn-bad" onClick={()=>rejeitarUsr(u.id)}>Rejeitar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── EMPRESAS ── */}
        {tab==='empresas' && (
          <div>
            {/* modal cadastro completo */}
            {showCadEmpFull && (
              <div className="adm-modal-bg" onClick={()=>setShowCadEmpFull(false)}>
                <div className="adm-modal adm-modal-full" onClick={e=>e.stopPropagation()}>
                  <div className="adm-modal-header">
                    <div><h3>Cadastrar empresa</h3><p>Preencha todas as informações que aparecerão no perfil institucional.</p></div>
                    <button className="av-close" onClick={()=>setShowCadEmpFull(false)}><Icon name="plus" size={16} stroke={2.4} style={{transform:'rotate(45deg)'}}/></button>
                  </div>

                  {/* Seção: Logo */}
                  <div className="cad-section">
                    <h4 className="cad-sec-title">Logo da empresa</h4>
                    <div
                      className={`logo-drop ${logoDrag?'drag':''} ${cadEmpFull.logoUrl?'has-img':''}`}
                      onDragOver={e=>{e.preventDefault();setLogoDrag(true);}}
                      onDragLeave={()=>setLogoDrag(false)}
                      onDrop={e=>handleLogoDrop(e,setCadEmpFull)}
                      onClick={()=>document.getElementById('logo-input-full').click()}
                    >
                      {cadEmpFull.logoUrl
                        ? <img src={cadEmpFull.logoUrl} alt="logo" className="logo-preview" />
                        : <><Icon name="building" size={28} stroke={1.5}/><span>Arraste a logo aqui ou clique para selecionar</span><small>PNG, SVG ou JPG · máx. 2 MB</small></>}
                      <input id="logo-input-full" type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleLogoDrop(e,setCadEmpFull)} />
                    </div>
                    {cadEmpFull.logoUrl && <button className="link" style={{fontSize:12,marginTop:6}} onClick={()=>setCadEmpFull(d=>({...d,logoUrl:''}))}>Remover logo</button>}
                  </div>

                  {/* Seção: Identificação */}
                  <div className="cad-section">
                    <h4 className="cad-sec-title">Identificação</h4>
                    <div className="adm-cad-grid3">
                      <div className="field"><label className="field-label">Razão social *</label><input placeholder="Nome da empresa Ltda" value={cadEmpFull.nome} onChange={e=>setCadEmpFull(d=>({...d,nome:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">CNPJ *</label><input placeholder="00.000.000/0001-00" value={cadEmpFull.cnpj} onChange={e=>setCadEmpFull(d=>({...d,cnpj:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Ramo / Setor</label>
                        <select value={cadEmpFull.setor} onChange={e=>setCadEmpFull(d=>({...d,setor:e.target.value}))}>
                          {SETORES_AD.map(s=><option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="field"><label className="field-label">Cidade</label><input placeholder="Maringá" value={cadEmpFull.cidade} onChange={e=>setCadEmpFull(d=>({...d,cidade:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Endereço completo</label><input placeholder="Rua, número, bairro" value={cadEmpFull.endereco} onChange={e=>setCadEmpFull(d=>({...d,endereco:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Site</label><input placeholder="www.empresa.com.br" value={cadEmpFull.site} onChange={e=>setCadEmpFull(d=>({...d,site:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Ano de fundação</label><input type="number" placeholder="2005" min="1900" max="2026" value={cadEmpFull.fundada} onChange={e=>setCadEmpFull(d=>({...d,fundada:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Número de funcionários</label>
                        <select value={cadEmpFull.funcionarios} onChange={e=>setCadEmpFull(d=>({...d,funcionarios:e.target.value}))}>
                          <option value="">Selecione</option>
                          {['1 a 10','11 a 50','51 a 100','101 a 500','501 a 1.000','1.001 a 5.000','5.000+'].map(o=><option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seção: Perfil público */}
                  <div className="cad-section">
                    <h4 className="cad-sec-title">Perfil público · Institucional</h4>
                    <div className="field" style={{marginBottom:12}}>
                      <label className="field-label">Descrição curta <small>(aparece nos cards de vaga)</small></label>
                      <input placeholder="Ex: Rede de supermercados com forte presença no Norte do Paraná." value={cadEmpFull.sobre} onChange={e=>setCadEmpFull(d=>({...d,sobre:e.target.value}))} />
                    </div>
                    <div className="field" style={{marginBottom:12}}>
                      <label className="field-label">Descrição completa <small>(página institucional)</small></label>
                      <textarea className="adm-textarea" rows={4} placeholder="Conte a história, valores e cultura da empresa..." value={cadEmpFull.sobreLongo} onChange={e=>setCadEmpFull(d=>({...d,sobreLongo:e.target.value}))} />
                    </div>
                    <div className="adm-cad-grid3">
                      <div className="field"><label className="field-label">Destaque 1</label><input placeholder="Ex: Mais de 40 anos de história" value={cadEmpFull.dest1} onChange={e=>setCadEmpFull(d=>({...d,dest1:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Destaque 2</label><input placeholder="Ex: Programa Jovem Aprendiz" value={cadEmpFull.dest2} onChange={e=>setCadEmpFull(d=>({...d,dest2:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Destaque 3</label><input placeholder="Ex: Plano de carreira" value={cadEmpFull.dest3} onChange={e=>setCadEmpFull(d=>({...d,dest3:e.target.value}))} /></div>
                    </div>
                  </div>

                  {/* Seção: Acesso */}
                  <div className="cad-section">
                    <h4 className="cad-sec-title">Responsável e acesso</h4>
                    <div className="adm-cad-grid3">
                      <div className="field"><label className="field-label">Responsável</label><input placeholder="Nome do contato" value={cadEmpFull.responsavel} onChange={e=>setCadEmpFull(d=>({...d,responsavel:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">E-mail *</label><input type="email" placeholder="rh@empresa.com.br" value={cadEmpFull.email} onChange={e=>setCadEmpFull(d=>({...d,email:e.target.value}))} /></div>
                      <div className="field"><label className="field-label">Telefone</label><input placeholder="(44) 99000-0000" value={cadEmpFull.tel} onChange={e=>setCadEmpFull(d=>({...d,tel:e.target.value}))} /></div>
                    </div>
                    <div className="field" style={{marginTop:12}}>
                      <label className="field-label">Pacote contratado</label>
                      <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
                        {PLANOS_AD.map((p,i)=>(
                          <button key={p} type="button" className={`arf-fmt adm-pkg-btn-${i} ${cadEmpFull.pacote===p?'on':''}`} onClick={()=>setCadEmpFull(d=>({...d,pacote:p}))}>
                            {p} <small style={{fontWeight:400,opacity:.75}}>{p==='Atrair'?'3 vagas/mês':p==='Conectar'?'12 vagas/mês':'Ilimitado'}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="adm-modal-acts" style={{marginTop:8}}>
                    <Btn variant="ghost" onClick={()=>setShowCadEmpFull(false)}>Cancelar</Btn>
                    <Btn icon="check" onClick={submitCadEmpFull}>Cadastrar e enviar para aprovação</Btn>
                  </div>
                </div>
              </div>
            )}

            <div className="adm-aprov-head">
              <div>
                <h2>Empresas cadastradas <span className="tab-count" style={{verticalAlign:'middle'}}>{empresas.length}</span></h2>
                <p>Gerencie planos, verificação e status de acesso das empresas ativas.</p>
              </div>
              <Btn icon="plus" onClick={()=>setShowCadEmpFull(true)}>Cadastrar empresa</Btn>
            </div>
            <div className="adm-users-table">
              <div className="adm-ut-head">
                <span>Empresa</span><span>Setor</span><span>Plano</span><span>Vagas</span><span>Status</span><span>Ações</span>
              </div>
              {empresas.map(e=>{
                const st=getStatus(e.id); const plan=userPlan[e.id]||'Atrair'; const verif=isVerified(e);
                return (
                  <div key={e.id} className={`adm-ut-row ${st==='bloqueada'?'blocked':''}`}>
                    <div className="adm-ut-co">
                      <CompanyMark empresa={e} size={36}/>
                      <div>
                        <strong>{e.nome}</strong>
                        {verif
                          ? <span className="verif" style={{fontSize:11,display:'flex',alignItems:'center',gap:3,marginTop:1}}>
                              <Icon name="shield" size={11}/> Verificada
                              <span style={{color:'var(--ink-40)',fontWeight:400,marginLeft:2}}>
                                · {planVerifica(plan)?'via plano':'manual'}
                              </span>
                            </span>
                          : <span style={{fontSize:11,color:'var(--ink-40)',display:'block',marginTop:1}}>Não verificada</span>
                        }
                      </div>
                    </div>
                    <span className="adm-ut-setor">{e.setor}</span>
                    <span>
                      <select className="adm-plan-sel" value={plan} onChange={ev=>changePlan(e.id,ev.target.value)}>
                        {PLANOS_AD.map(p=><option key={p}>{p}</option>)}
                      </select>
                    </span>
                    <span className="adm-ut-n"><Icon name="doc" size={13}/> {e.vagasAbertas}</span>
                    <span className={`vt-st ${st==='bloqueada'?'closed':'open'}`}>{st==='bloqueada'?'Bloqueada':'Ativa'}</span>
                    <div className="adm-ut-acts">
                      <button
                        className={`btn btn-sm ${verif?'btn-bad':'btn-ghost'}`}
                        onClick={()=>toggleVerify(e.id)}
                        title={verif?'Revogar verificação':'Verificar empresa manualmente'}
                      >
                        <Icon name="shield" size={13}/> {verif?'Revogar':'Verificar'}
                      </button>
                      <button className={`btn btn-sm ${st==='bloqueada'?'btn-ghost':'btn-bad'}`} onClick={()=>toggleBlock(e.id)}>
                        {st==='bloqueada'?'Desbloquear':'Bloquear'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONTEÚDO ── */}
        {tab==='conteudo' && (
          <div>
            {rejectId && (
              <div className="adm-modal-bg" onClick={()=>setRejectId(null)}>
                <div className="adm-modal" onClick={e=>e.stopPropagation()}>
                  <h3>Reprovar publicação</h3>
                  <p>Informe o motivo para a empresa poder corrigir e reenviar.</p>
                  <textarea className="adm-textarea" rows={4} value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Ex: Faltam dados que comprovem a afirmação..."/>
                  <div className="adm-modal-acts">
                    <Btn variant="ghost" onClick={()=>setRejectId(null)}>Cancelar</Btn>
                    <button className="btn btn-bad" onClick={handleReject}>Reprovar</button>
                  </div>
                </div>
              </div>
            )}
            <div className="adm-cont-filters">
              {[['todos','Todos',pubs.length],['pendente','Pendentes',pendentes.length],['aprovada','Aprovadas',pubs.filter(p=>p.status==='aprovada').length],['reprovada','Reprovadas',pubs.filter(p=>p.status==='reprovada').length]]
                .map(([k,l,n])=>(
                  <button key={k} className={`cf-pill ${contFiltro===k?'on':''}`} onClick={()=>setContFiltro(k)}>
                    {l} <span className="cf-n">{n}</span>
                  </button>
                ))}
            </div>
            <div className="mod-list">
              {contFiltrada.map(p=>{
                const emp=p.empresa?window.empById(p.empresa):null;
                return (
                  <div key={p.id} className="mod-card">
                    <div className="mod-preview"><Placeholder label={p.categoria}/></div>
                    <div className="mod-body">
                      <div className="mod-co">
                        {emp && <CompanyMark empresa={emp} size={26}/>}
                        <strong>{emp?emp.nome:'Redação MaringáPost'}</strong>
                        <span className={`mod-cat pub-st ${p.status==='aprovada'?'ok':p.status==='reprovada'?'bad':'warn'}`}>{p.status}</span>
                      </div>
                      <h3>{p.titulo}</h3>
                      <p>{p.lead}</p>
                      {p.motivo && <div className="cc-reject"><Icon name="shield" size={14}/><span>{p.motivo}</span></div>}
                    </div>
                    <div className="mod-actions">
                      {p.status==='pendente' && (
                        <>
                          <Btn icon="check" onClick={()=>approvePub(p.id)}>Aprovar</Btn>
                          <button className="btn btn-bad" onClick={()=>{setRejectId(p.id);setMotivo('');}}>Reprovar</button>
                        </>
                      )}
                      <span className="mod-prev">{p.data}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PACOTES ── */}
        {tab==='pacotes' && (
          <div>
            <div className="adm-pkg-head">
              <div>
                <h2>Recursos por pacote</h2>
                <p>Configure as funcionalidades disponíveis em cada plano · <strong>Atrair</strong> (3 vagas/mês) · <strong>Conectar</strong> (12 vagas/mês) · <strong>CrescerPro</strong> (ilimitado)</p>
              </div>
              <Btn icon="check" onClick={()=>setFeatSaved(true)}>{featSaved?'✓ Salvo':'Salvar configuração'}</Btn>
            </div>
            <div className="adm-feat-table">
              <div className="adm-feat-head">
                <span>Recurso</span>
                {PLANOS_AD.map((p,i)=>(
                  <span key={p} className={`adm-plan-head adm-pp-${i}`}>
                    {p}
                    <span style={{display:'block',fontSize:10,fontWeight:600,opacity:.7,marginTop:2}}>
                      {p==='Atrair'?'3 vagas/mês':p==='Conectar'?'12 vagas/mês':'Ilimitado'}
                    </span>
                  </span>
                ))}
              </div>
              {FEATURE_GROUPS.map(g=>(
                <React.Fragment key={g.group}>
                  <div className="adm-feat-group">{g.group}</div>
                  {g.items.map(item=>(
                    <div key={item.id} className="adm-feat-row">
                      <span className="adm-feat-label">{item.label}</span>
                      {PLANOS_AD.map((p,i)=>(
                        <div key={p} className="adm-feat-cell">
                          <button
                            className={`adm-toggle adm-toggle-${i} ${features[item.id][i]?'on':''}`}
                            onClick={()=>toggleFeat(item.id,i)}
                            title={`${features[item.id][i]?'Desativar':'Ativar'} no plano ${p}`}
                          >
                            {features[item.id][i]
                              ? <Icon name="check" size={14} stroke={2.4}/>
                              : <Icon name="plus"  size={13} stroke={2} style={{transform:'rotate(45deg)',opacity:.3}}/>
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

Object.assign(window, { AdminScreen });
