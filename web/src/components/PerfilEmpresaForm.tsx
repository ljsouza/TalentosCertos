"use client";
import { useActionState, useState } from "react";
import { atualizarPerfilEmpresa } from "@/app/painel-empresa/actions";
import { uploadLogo } from "@/lib/storage-upload";
import type { EmpresaPerfil } from "@/data/types";

type Props = { empresa: EmpresaPerfil };

export function PerfilEmpresaForm({ empresa: e }: Props) {
  const [state, formAction, pending] = useActionState(atualizarPerfilEmpresa, undefined);
  const [logoUrl, setLogoUrl] = useState<string>(e.logo_url ?? "");
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoErro, setLogoErro] = useState<string | null>(null);

  const onLogo = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setLogoErro(null);
    setLogoLoading(true);
    try {
      setLogoUrl(await uploadLogo(e.id, file));
    } catch (err) {
      setLogoErro(err instanceof Error ? err.message : "Falha ao enviar a logo.");
    } finally {
      setLogoLoading(false);
    }
  };

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

      <label>Site<input name="site" type="url" defaultValue={e.site ?? ""} placeholder="https://suaempresa.com.br" /></label>

      <label>
        Logo da empresa
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo externa (Supabase Storage); next/image exigiria remotePatterns por projeto */}
          {logoUrl && <img src={logoUrl} alt="Logo atual" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, border: "1px solid var(--line)" }} />}
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            {logoLoading ? "Enviando…" : logoUrl ? "Trocar logo" : "Enviar logo"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onLogo} style={{ display: "none" }} disabled={logoLoading} />
          </label>
        </div>
      </label>
      {logoErro && <p className="auth-erro" role="alert">{logoErro}</p>}
      <input type="hidden" name="logo_url" value={logoUrl} />

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
