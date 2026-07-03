"use client";
import { useActionState } from "react";
import { atualizarPerfilEmpresa } from "@/app/painel-empresa/actions";
import type { EmpresaPerfil } from "@/data/types";

type Props = { empresa: EmpresaPerfil };

export function PerfilEmpresaForm({ empresa: e }: Props) {
  const [state, formAction, pending] = useActionState(atualizarPerfilEmpresa, undefined);

  return (
    <form action={formAction} className="vaga-form">
      <label>Nome da empresa<input name="nome" required defaultValue={e.nome ?? ""} placeholder="Ex.: Apitec Engenharia" /></label>

      <div className="vf-row">
        <label>Setor<input name="setor" defaultValue={e.setor ?? ""} placeholder="Ex.: Indústria / Engenharia" /></label>
        <label>Fundada em<input name="fundada" type="number" min="1800" defaultValue={e.fundada ?? ""} placeholder="2012" /></label>
      </div>

      <div className="vf-row">
        <label>Nº de funcionários<input name="funcionarios" defaultValue={e.funcionarios ?? ""} placeholder="Ex.: 51–200" /></label>
        <label>Endereço<input name="endereco" defaultValue={e.endereco ?? ""} placeholder="Maringá, PR" /></label>
      </div>

      <div className="vf-row">
        <label>Site<input name="site" type="url" defaultValue={e.site ?? ""} placeholder="https://suaempresa.com.br" /></label>
        <label>Logo (URL)<input name="logo_url" type="url" defaultValue={e.logo_url ?? ""} placeholder="https://.../logo.png" /></label>
      </div>

      <label>Resumo <small>(uma frase, aparece nos cards)</small><textarea name="sobre" rows={2} defaultValue={e.sobre ?? ""} placeholder="O que sua empresa faz, em uma frase." /></label>
      <label>Sobre a empresa<textarea name="sobre_longo" rows={4} defaultValue={e.sobre_longo ?? ""} placeholder="História, cultura e o que torna o trabalho aqui especial." /></label>
      <label>Diferenciais <small>(um por linha)</small><textarea name="destaques" rows={3} defaultValue={(e.destaques ?? []).join("\n")} placeholder={"Plano de carreira\nSquad de dados próprio"} /></label>
      <label>Vídeo do YouTube <small>(opcional)</small><input name="video_youtube" type="url" defaultValue={e.video_youtube ?? ""} placeholder="https://youtube.com/watch?v=..." /></label>

      {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}
      {state?.ok && <p className="auth-ok" role="status">Perfil atualizado.</p>}
      <button type="submit" className="btn btn-primary btn-full" disabled={pending}>{pending ? "Salvando…" : "Salvar perfil"}</button>
    </form>
  );
}
