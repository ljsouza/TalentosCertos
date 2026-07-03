// components.jsx — shared UI for MaringáPost Empregos
const { useState } = React;

// ---- Icons (simple, standard UI glyphs) ----
function Icon({ name, size = 20, stroke = 1.7, style }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" {...p} /><line x1="16.5" y1="16.5" x2="21" y2="21" {...p} /></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>,
    bookmark: <path d="M6 4h12v16l-6-4-6 4z" {...p} />,
    arrow: <><line x1="4" y1="12" x2="20" y2="12" {...p} /><polyline points="14 6 20 12 14 18" {...p} /></>,
    chevron: <polyline points="6 9 12 15 18 9" {...p} />,
    check: <polyline points="4 12 10 18 20 6" {...p} />,
    star: <path d="M12 3l2.6 5.6L20.5 9l-4.5 4.2 1.2 6.1L12 16.8 6.8 19.3 8 13.2 3.5 9l5.9-.4z" {...p} />,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><polyline points="12 7 12 12 16 14" {...p} /></>,
    users: <><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" {...p} /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M20.5 20a5.5 5.5 0 0 0-4-5.3" {...p} /></>,
    whatsapp:   <path d="M5 19l1.2-3.4A7 7 0 1 1 9.4 18L5 19z" {...p} />,
    share:      <><circle cx="18" cy="5" r="3" {...p}/><circle cx="6" cy="12" r="3" {...p}/><circle cx="18" cy="19" r="3" {...p}/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" {...p}/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" {...p}/></>,
    facebook:   <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" {...p}/>,
    xtwitter:   <><line x1="17" y1="7" x2="7" y2="17" {...p}/><line x1="7" y1="7" x2="17" y2="17" {...p}/></>,
    linkedin:   <><rect x="2" y="2" width="20" height="20" rx="4" {...p}/><line x1="8" y1="10" x2="8" y2="16" {...p}/><circle cx="8" cy="7" r="1.2" fill="currentColor" stroke="none"/><path d="M12 10v6M12 13a3 3 0 0 1 6 0v3" {...p}/></>,
    telegram:   <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" {...p}/>,
    instagram:  <><rect x="2" y="2" width="20" height="20" rx="5" {...p}/><circle cx="12" cy="12" r="5" {...p}/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></>,
    link:       <><path d="M10 13a5 5 0 0 0 7.5.7l3-3a5 5 0 0 0-7-7l-1.7 1.6" {...p}/><path d="M14 11a5 5 0 0 0-7.5-.7l-3 3a5 5 0 0 0 7 7l1.7-1.6" {...p}/></>,
    building:   <><rect x="3" y="7" width="18" height="14" rx="1" {...p}/><path d="M8 21V7M16 21V7M3 12h18" {...p}/><rect x="9" y="2" width="6" height="5" rx="1" {...p}/></>,
    layers:     <><polygon points="12 2 2 7 12 12 22 7" {...p}/><polyline points="2 17 12 22 22 17" {...p}/><polyline points="2 12 12 17 22 12" {...p}/></>,
    globe:      <><circle cx="12" cy="12" r="9" {...p}/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" {...p}/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" {...p} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...p} /></>,
    play: <polygon points="8 5 19 12 8 19" {...p} />,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" {...p} /><polygon points="16 10 21 7 21 17 16 14" {...p} /></>,
    upload: <><path d="M12 16V5" {...p} /><polyline points="7 9 12 4 17 9" {...p} /><path d="M5 16v3h14v-3" {...p} /></>,
    bolt: <path d="M13 3L5 13h5l-1 8 8-11h-5z" {...p} />,
    chart: <><line x1="5" y1="20" x2="5" y2="11" {...p} /><line x1="12" y1="20" x2="12" y2="5" {...p} /><line x1="19" y1="20" x2="19" y2="14" {...p} /></>,
    map: <><polygon points="3 6 9 4 15 6 21 4 21 18 15 20 9 18 3 20" {...p} /><line x1="9" y1="4" x2="9" y2="18" {...p} /><line x1="15" y1="6" x2="15" y2="20" {...p} /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" {...p} /><line x1="5" y1="12" x2="19" y2="12" {...p} /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    doc: <><path d="M7 3h7l4 4v14H7z" {...p} /><polyline points="14 3 14 7 18 7" {...p} /></>,
    shield: <path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" {...p} />,
    heart: <path d="M12 20s-7-4.3-9.3-9A4.6 4.6 0 0 1 12 6.5 4.6 4.6 0 0 1 21.3 11C19 15.7 12 20 12 20z" {...p} />,
    chat: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" {...p} />,
    flame: <path d="M12 3c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-1.5.5-2.5 1.2-3.3C9 9 11 7 12 3z" {...p} />,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">{paths[name]}</svg>;
}

// ---- Logo ----
function Logo({ size = 22, onClick }) {
  return (
    <button className="logo" onClick={onClick} aria-label="MaringáPost Empregos — início">
      <span className="logo-word" style={{ fontSize: size }}>MARINGÁ POST</span>
      <span className="logo-vert">EMPREGOS</span>
    </button>
  );
}

function Money({ min, max }) {
  const f = (n) => "R$ " + n.toLocaleString("pt-BR");
  if (!min) return <span>A combinar</span>;
  return <span>{f(min)}{max ? ` – ${f(max)}` : ""}</span>;
}

// ---- Badges ----
function TypeBadge({ tipo }) {
  const t = window.TIPOS[tipo];
  if (!t) return null;
  return <span className="chip chip-type">{t.label}</span>;
}

function RespondeBadge({ tempo, compact }) {
  return (
    <span className="badge-responde" title={`Responde candidatos em média em ${tempo}`}>
      <Icon name="check" size={13} stroke={2.4} />
      {compact ? "Responde" : `Responde · ${tempo}`}
    </span>
  );
}

function MatchRing({ value, size = 46 }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  const tone = value >= 85 ? "var(--accent)" : value >= 70 ? "var(--accent-2)" : "var(--ink-40)";
  return (
    <div className="match-ring" style={{ width: size, height: size }} title={`${value}% de compatibilidade`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="match-num" style={{ color: tone }}>{value}</span>
    </div>
  );
}

// ---- Modalidade badge ----
function ModalidadeBadge({ modalidade }) {
  const m = window.MODALIDADES && window.MODALIDADES[modalidade];
  if (!m) return null;
  return (
    <span className={`chip mod-badge mod-${modalidade}`}>
      <Icon name={m.icon} size={12} stroke={2} />{m.label}
    </span>
  );
}

// ---- Share menu ----
function ShareMenu({ vaga, up = false }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const url = `https://empregos.maringapost.com.br/vaga/${vaga.id}`;
  const text = `${vaga.titulo} em ${vaga.cidade} — MaringáPost Empregos`;
  const enc = encodeURIComponent;

  const nets = [
    { id: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', href: `https://wa.me/?text=${enc(text + '\n' + url)}` },
    { id: 'facebook',  label: 'Facebook',  color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { id: 'xtwitter',  label: 'X',         color: '#000',    href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { id: 'telegram',  label: 'Telegram',  color: '#26A5E4', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { id: 'instagram', label: 'Instagram', color: '#E1306C', href: null },
  ];

  const doToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => doToast('Link copiado!')).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      doToast('Link copiado!');
    });
    setOpen(false);
  };

  const handleNet = (net) => {
    if (net.href) {
      window.open(net.href, '_blank', 'noopener,noreferrer');
    } else {
      navigator.clipboard.writeText(url).then(() => doToast('Link copiado! Cole no Instagram.')).catch(() => doToast('Copie: ' + url));
    }
    setOpen(false);
  };

  return (
    <div className="share-wrap" onClick={ev => ev.stopPropagation()}>
      <button className="icon-btn" onClick={() => setOpen(o => !o)} aria-label="Compartilhar vaga" title="Compartilhar">
        <Icon name="share" size={18} />
      </button>
      {toast && <div className="share-toast">{toast}</div>}
      {open && (
        <>
          <div className="share-backdrop" onClick={() => setOpen(false)} />
          <div className={`share-menu${up ? ' up' : ''}`}>
            <p className="share-menu-label">Compartilhar vaga</p>
            <div className="share-nets">
              {nets.map(n => (
                <button key={n.id} className="share-net" onClick={() => handleNet(n)} title={n.label} style={{ '--sn-color': n.color }}>
                  <span className="sn-icon"><Icon name={n.id} size={20} /></span>
                  <span className="sn-label">{n.label}</span>
                </button>
              ))}
            </div>
            <button className="share-copy-row" onClick={copyLink}>
              <Icon name="link" size={15} />
              <span>Copiar link</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Company avatar (logomarca de exemplo; sobreposível por logo real) ----
function CompanyMark({ empresa, size = 44 }) {
  const e = typeof empresa === "string" ? window.empById(empresa) : empresa;
  if (!e) return null;
  const uri = window.brandLogo(e.id);
  if (!uri) {
    const initials = e.nome.split(" ").slice(0, 2).map((w) => w[0]).join("");
    return <div className="co-mark" style={{ width: size, height: size, fontSize: size * 0.34 }}>{initials}</div>;
  }
  return (
    <div className="co-mark" style={{ width: size, height: size, padding: 0, overflow: "hidden" }}>
      <img src={uri} alt={e.nome} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// ---- Buttons ----
function Btn({ children, variant = "primary", icon, onClick, type = "button", full, size }) {
  return (
    <button type={type} className={`btn btn-${variant} ${full ? "btn-full" : ""} ${size === "sm" ? "btn-sm" : ""}`} onClick={onClick}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

// ---- Job card ----
function JobCard({ vaga, density = "regular", onOpen, onSave, saved, logado = false }) {
  const e = window.empById(vaga.empresa);
  const ringSize = density === "compact" ? 40 : 46;
  return (
    <article className={`jobcard ${density} ${vaga.destaque ? "is-feat" : ""}`} onClick={() => onOpen(vaga.id)}>
      {vaga.destaque && <span className="feat-flag"><Icon name="star" size={12} stroke={2} /> Destaque</span>}
      <div className="jc-top">
        <CompanyMark empresa={e} size={density === "compact" ? 38 : 46} />
        <div className="jc-headings">
          <h3 className="jc-title">{vaga.titulo}</h3>
          <div className="jc-co">{e.nome}{e.verificada && <Icon name="shield" size={13} style={{ color: "var(--accent)" }} />}</div>
        </div>
        {logado && <MatchRing value={vaga.match} size={ringSize} />}
      </div>
      <div className="jc-meta">
        <span><Icon name="pin" size={15} /> {vaga.cidade}</span>
        <span><Icon name="clock" size={15} /> {vaga.postada}</span>
        <span><Icon name="users" size={15} /> {vaga.candidatos} candidatos</span>
      </div>
      {density !== "compact" && <p className="jc-desc">{vaga.descricao}</p>}
      <div className="jc-foot">
        <div className="jc-sal"><Money min={vaga.salarioMin} max={vaga.salarioMax} /></div>
        <div className="jc-chips">
          {vaga.modalidade && <ModalidadeBadge modalidade={vaga.modalidade} />}
          {vaga.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
          {vaga.filtroAtivo && <span className="chip chip-arf"><Icon name={vaga.filtroAtivo.formato === "video" ? "video" : "mic"} size={12} /> 30s</span>}
        </div>
      </div>
      <div className="jc-actions" onClick={(ev) => ev.stopPropagation()}>
        {e.responde && <RespondeBadge tempo={e.tempoResposta} compact />}
        <span className="jc-spacer" />
        <ShareMenu vaga={vaga} up />
        <button className={`icon-btn ${saved ? "on" : ""}`} onClick={() => onSave(vaga.id)} aria-label="Salvar vaga">
          <Icon name="bookmark" size={18} stroke={saved ? 0 : 1.7} style={{ fill: saved ? "var(--accent)" : "none" }} />
        </button>
        <Btn size="sm" variant="ghost" icon="arrow" onClick={() => onOpen(vaga.id)}>Ver vaga</Btn>
      </div>
    </article>
  );
}

// ---- Section header (editorial) ----
function SectionHead({ chapeu, titulo, action }) {
  return (
    <div className="sec-head">
      <div>
        {chapeu && <span className="chapeu">{chapeu}</span>}
        <h2 className="sec-title">{titulo}</h2>
      </div>
      {action}
    </div>
  );
}

// ---- Image placeholder ----
function Placeholder({ label, ratio = "16/9", radius = 4 }) {
  return (
    <div className="ph" style={{ aspectRatio: ratio, borderRadius: radius }}>
      <span className="ph-label">{label}</span>
    </div>
  );
}

Object.assign(window, {
  Icon, Logo, Money, TypeBadge, ModalidadeBadge, RespondeBadge, MatchRing, CompanyMark, Btn, JobCard, SectionHead, Placeholder, ShareMenu,
});
