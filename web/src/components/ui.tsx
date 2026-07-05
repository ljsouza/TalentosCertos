import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { TIPOS, MODALIDADES, brandLogo } from "@/lib/refs";
import type { Empresa } from "@/data/types";

// Componentes presentacionais puros (sem hooks) — usáveis em Server ou Client.

export function Logo({ size = 22, onClick, word = "MaringáPost", tag = "Empregos" }: { size?: number; onClick?: () => void; word?: string; tag?: string }) {
  return (
    <button className="logo" onClick={onClick} aria-label={`${word} ${tag} — início`}>
      <span className="logo-word" style={{ fontSize: size }}>{word}</span>
      <span className="logo-vert">{tag}</span>
    </button>
  );
}

export function Money({ min, max }: { min: number | null; max: number | null }) {
  const f = (n: number) => "R$ " + n.toLocaleString("pt-BR");
  if (!min) return <span>A combinar</span>;
  return <span>{f(min)}{max ? ` – ${f(max)}` : ""}</span>;
}

export function TypeBadge({ tipo }: { tipo: string }) {
  const t = TIPOS[tipo];
  if (!t) return null;
  return <span className="chip chip-type">{t.label}</span>;
}

export function ModalidadeBadge({ modalidade }: { modalidade: string }) {
  const m = MODALIDADES[modalidade];
  if (!m) return null;
  return (
    <span className={`chip mod-badge mod-${modalidade}`}>
      <Icon name={m.icon} size={12} stroke={2} />{m.label}
    </span>
  );
}

export function RespondeBadge({ tempo, compact }: { tempo: string | null; compact?: boolean }) {
  return (
    <span className="badge-responde" title={`Responde candidatos em média em ${tempo}`}>
      <Icon name="check" size={13} stroke={2.4} />
      {compact ? "Responde" : `Responde · ${tempo}`}
    </span>
  );
}

export function MatchRing({ value, size = 46 }: { value: number; size?: number }) {
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

// Logomarca: usa logo real (Storage) se houver; senão a marca geométrica de
// exemplo (chave derivada do id do seed); senão iniciais.
function marcaKey(id: string): string {
  const last = id.slice(-1); // seed: ...e1000000000N → N ∈ 1..7
  return /[1-7]/.test(last) ? `e${last}` : "";
}

export function CompanyMark({ empresa, size = 44 }: { empresa: Empresa | null; size?: number }) {
  if (!empresa) return null;
  const uri = empresa.logo_url || brandLogo(marcaKey(empresa.id));
  if (!uri) {
    const initials = empresa.nome.split(" ").slice(0, 2).map((w) => w[0]).join("");
    return <div className="co-mark" style={{ width: size, height: size, fontSize: size * 0.34 }}>{initials}</div>;
  }
  return (
    <div className="co-mark" style={{ width: size, height: size, padding: 0, overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={uri} alt={empresa.nome} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export function Btn({
  children, variant = "primary", icon, onClick, type = "button", full, size,
}: {
  children: ReactNode; variant?: string; icon?: string; onClick?: () => void;
  type?: "button" | "submit"; full?: boolean; size?: "sm";
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${full ? "btn-full" : ""} ${size === "sm" ? "btn-sm" : ""}`} onClick={onClick}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

export function SectionHead({ chapeu, titulo, action }: { chapeu?: string; titulo: string; action?: ReactNode }) {
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

export function Placeholder({ label, ratio = "16/9", radius = 4 }: { label: string; ratio?: string; radius?: number }) {
  return (
    <div className="ph" style={{ aspectRatio: ratio, borderRadius: radius } as CSSProperties}>
      <span className="ph-label">{label}</span>
    </div>
  );
}
