import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Cadastro de candidato" };

export default function CadastroCandidatoPage() {
  return (
    <div className="auth-wrap">
      <span className="chapeu">Candidato</span>
      <h1>Crie seu perfil</h1>
      <p className="auth-lead">Cadastre-se para se candidatar em 1 clique, salvar vagas e entrar no radar das empresas.</p>
      <div className="auth-card">
        <AuthForm mode="signup" papel="candidato" />
      </div>
      <p className="auth-alt">
        Já tem conta? <Link href="/entrar">Entrar</Link>. É uma empresa? <Link href="/empresa">Cadastre sua empresa</Link>.
      </p>
    </div>
  );
}
