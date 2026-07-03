"use client";
import { useState, useTransition } from "react";
import { excluirConta } from "@/app/auth/actions";

// LGPD: exclusão de conta com dupla confirmação. Chama a server action, que
// apaga os dados e encerra a sessão.
export function ExcluirContaButton() {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  const onClick = () => {
    if (!confirm("Excluir permanentemente sua conta e todos os seus dados (currículo, candidaturas, vagas, publicações)? Esta ação é irreversível.")) return;
    setErro(null);
    startTransition(async () => {
      try {
        await excluirConta();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível excluir a conta.");
      }
    });
  };

  return (
    <div>
      <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost btn-sm" style={{ color: "#b42318", borderColor: "#f3c4bd" }}>
        {pending ? "Excluindo…" : "Excluir minha conta"}
      </button>
      {erro && <p className="auth-erro" role="alert">{erro}</p>}
    </div>
  );
}
