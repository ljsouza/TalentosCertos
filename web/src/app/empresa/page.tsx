import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Área da empresa" };

export default function EmpresaPage() {
  return (
    <div className="auth-wrap">
      <span className="chapeu">Para empresas</span>
      <h1>Cadastre sua empresa</h1>
      <p className="auth-lead">Publique vagas, receba candidatos e ganhe o selo de empresa verificada do MaringáPost.</p>
      <div className="auth-card">
        <AuthForm mode="signup" papel="empresa" />
      </div>
      <p className="auth-alt">
        Já tem conta? <Link href="/entrar">Entrar</Link>. Quer ver os planos? <Link href="/pacotes">Conhecer planos</Link>.
      </p>
    </div>
  );
}
