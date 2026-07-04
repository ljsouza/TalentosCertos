import Link from "next/link";

type Marca = { nome: string; regiao: string; logoWord: string; logoTag: string; footerSobre: string };

// Footer é só navegação — Server Component com Link (sem estado). A identidade
// (logo/nome/descrição/região) vem do tenant corrente.
export function SiteFooter({ brand }: { brand: Marca }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo" aria-label={`${brand.logoWord} ${brand.logoTag} — início`}>
            <span className="logo-word" style={{ fontSize: 18 }}>{brand.logoWord}</span>
            <span className="logo-vert">{brand.logoTag}</span>
          </Link>
          <p>{brand.footerSobre}</p>
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
            <h4>{brand.logoWord}</h4>
            <Link href="/conteudo">Carreira &amp; RH</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/admin">Moderação (admin)</Link>
          </div>
        </div>
      </div>
      <div className="footer-base">© 2026 {brand.nome} · {brand.regiao}</div>
    </footer>
  );
}
