import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="auth-wrap">
      <span className="chapeu">MaringáPost Empregos</span>
      <h1>Entrar na sua conta</h1>
      <p className="auth-lead">Acesse para se candidatar, salvar vagas e acompanhar suas candidaturas.</p>
      <div className="auth-card">
        <AuthForm mode="login" />
      </div>
      <p className="auth-alt">
        Ainda não tem conta? <Link href="/cadastro-candidato">Cadastre-se como candidato</Link> ou <Link href="/empresa">como empresa</Link>.
      </p>
    </div>
  );
}
