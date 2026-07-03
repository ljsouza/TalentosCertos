import Link from "next/link";

// Footer é só navegação — Server Component com Link (sem estado).
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo" aria-label="MaringáPost Empregos — início">
            <span className="logo-word" style={{ fontSize: 18 }}>MARINGÁ POST</span>
            <span className="logo-vert">EMPREGOS</span>
          </Link>
          <p>O portal de empregos do MaringáPost. Conectando talentos e empresas no Norte do Paraná com a credibilidade de quem informa a cidade há anos.</p>
          <span className="footer-tag">Independente, sempre.</span>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Candidatos</h4>
            <Link href="/">Buscar vagas</Link>
            <Link href="/cadastro-candidato">Cadastrar currículo</Link>
            <Link href="/painel-candidato">Minha conta</Link>
          </div>
          <div>
            <h4>Empresas</h4>
            <Link href="/pacotes">Planos</Link>
            <Link href="/empresa">Publicar vaga</Link>
            <Link href="/painel-empresa">Painel</Link>
          </div>
          <div>
            <h4>MaringáPost</h4>
            <Link href="/conteudo">Carreira &amp; RH</Link>
            <Link href="/">Sobre</Link>
            <Link href="/admin">Moderação (admin)</Link>
          </div>
        </div>
      </div>
      <div className="footer-base">© 2026 MaringáPost Empregos · Maringá, PR · Protótipo</div>
    </footer>
  );
}
