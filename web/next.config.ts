import type { NextConfig } from "next";

// O mesmo repositório gera dois builds (basePath é fixado em build e embutido
// no bundle do cliente — não muda em runtime):
//   • Deploy MaringáPost: NEXT_PUBLIC_BASE_PATH ausente → '/empregos' (embutido
//     em maringapost.com.br/empregos via reverse proxy).
//   • Deploy SaaS: NEXT_PUBLIC_BASE_PATH='' → sem prefixo (serve na raiz;
//     tenant resolvido pelo subdomínio <slug>.talentoscertos.com.br).
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
const basePath = rawBasePath === undefined ? "/empregos" : rawBasePath;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
  // No deploy com prefixo, a raiz do domínio direto do app redireciona para o
  // prefixo (em produção quem responde a / é o site principal). Sem prefixo
  // (SaaS), não há redirect.
  async redirects() {
    return basePath
      ? [{ source: "/", destination: basePath, basePath: false, permanent: false }]
      : [];
  },
};

export default nextConfig;
