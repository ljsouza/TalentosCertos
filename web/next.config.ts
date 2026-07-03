import type { NextConfig } from "next";

// Produção: servido em maringapost.com.br/empregos via reverse proxy.
// basePath faz o Next gerar todas as rotas e assets sob /empregos.
const nextConfig: NextConfig = {
  basePath: "/empregos",
  reactStrictMode: true,
  // Conveniência: a raiz redireciona para /empregos (em produção, o site
  // principal é quem responde a / — isto só vale no domínio direto do app).
  async redirects() {
    return [{ source: "/", destination: "/empregos", basePath: false, permanent: false }];
  },
};

export default nextConfig;
