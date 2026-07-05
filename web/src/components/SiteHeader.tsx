"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Logo, Btn } from "@/components/ui";
import { href, PRIMARY_NAV, MENU_GROUPS } from "@/lib/nav";
import { signOut } from "@/app/auth/actions";

type Perfil = { nome: string; papel: string } | null;
type Marca = { logoWord: string; logoTag: string };

function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div className="mm-overlay" onClick={onClose}>
      <div className="mm-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Menu da plataforma">
        <div className="mm-head">
          <span className="mm-head-title">Navegar pela plataforma</span>
          <button className="mm-x" onClick={onClose} aria-label="Fechar menu">×</button>
        </div>
        <div className="mm-body">
          {MENU_GROUPS.map((g) => (
            <div key={g.titulo} className="mm-group">
              <h4 className="mm-group-title">{g.titulo}</h4>
              <div className="mm-items">
                {g.itens.map((it) => (
                  <Link key={it.id} href={href(it.id)} onClick={onClose} className={`mm-item ${pathname === href(it.id) ? "on" : ""}`}>
                    <span className="mm-ic"><Icon name={it.icon} size={19} /></span>
                    <span className="mm-txt">
                      <strong>{it.label}</strong>
                      <small>{it.desc}</small>
                    </span>
                    <span className="mm-arrow"><Icon name="arrow" size={16} /></span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mm-foot">
          <Link className="mm-foot-btn prim" href="/cadastro-candidato" onClick={onClose}><Icon name="doc" size={16} /> Cadastrar currículo</Link>
          <Link className="mm-foot-btn" href="/admin" onClick={onClose}><Icon name="shield" size={16} /> Moderação (admin)</Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({ user, brand }: { user: Perfil; brand: Marca }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mmOpen, setMmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const painel = user?.papel === "empresa" ? "/painel-empresa" : "/painel-candidato";
  const iniciais = user ? user.nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "EU" : "";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="menu-btn" onClick={() => setMmOpen(true)} aria-label="Abrir menu da plataforma" title="Todos os menus">
          <span className="menu-btn-bars"><span></span><span></span><span></span></span>
        </button>
        <Logo size={20} word={brand.logoWord} tag={brand.logoTag} onClick={() => router.push("/")} />
        <nav className="nav-links">
          {PRIMARY_NAV.map((n) => (
            <Link key={n.id} href={href(n.id)} className={pathname === href(n.id) ? "on" : ""}>{n.label}</Link>
          ))}
        </nav>
        <div className="nav-cta">
          {user ? (
            <div className="avatar-wrap">
              <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Sua conta">
                <span className="avatar-circle">{iniciais}</span>
                <Icon name="chevron" size={15} style={{ transform: menuOpen ? "rotate(180deg)" : "none", transition: ".16s", color: "var(--ink-40)" }} />
              </button>
              {menuOpen && (
                <>
                  <div className="avatar-backdrop" onClick={() => setMenuOpen(false)} />
                  <div className="avatar-menu">
                    <div className="am-header">
                      <span className="avatar-circle lg">{iniciais}</span>
                      <div className="am-id">
                        <strong>{user.nome}</strong>
                        <span>{user.papel === "empresa" ? "Empresa" : "Candidato"}</span>
                      </div>
                    </div>
                    <Link className="am-item" href={painel} onClick={() => setMenuOpen(false)}><Icon name="users" size={16} /> Minha conta</Link>
                    <div className="am-sep" />
                    <form action={signOut}>
                      <button type="submit" className="am-item am-out"><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Sair</button>
                    </form>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link className="nav-ghost" href="/empresa">Sou empresa</Link>
              <Btn size="sm" icon="arrow" onClick={() => router.push("/cadastro-candidato")}>Sou candidato</Btn>
            </>
          )}
        </div>
        <button className="burger" onClick={() => setMmOpen(true)} aria-label="Menu">☰</button>
      </div>
      <MegaMenu open={mmOpen} onClose={() => setMmOpen(false)} />
    </header>
  );
}
