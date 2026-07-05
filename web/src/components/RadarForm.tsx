"use client";
import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { salvarRadar } from "@/app/painel-candidato/actions";

type Props = { inicial: { ativo: boolean; telefone: string; salarioMin: number | null } };

export function RadarForm({ inicial }: Props) {
  const [state, action, pending] = useActionState(salvarRadar, undefined);
  const [ativo, setAtivo] = useState(inicial.ativo);

  return (
    <form action={action} className="vaga-form">
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
        <input type="checkbox" name="radar_ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
        <span><Icon name="bolt" size={15} /> Ativar Radar de Vagas por WhatsApp</span>
      </label>
      <p style={{ color: "var(--ink-60)", fontSize: 13, margin: "2px 0 0" }}>
        Receba um alerta assim que uma vaga compatível com seu perfil (área/cidade) for publicada.
      </p>

      {ativo && (
        <>
          <div className="vf-row">
            <label>WhatsApp<input name="telefone" defaultValue={inicial.telefone} placeholder="(44) 99999-9999" /></label>
            <label>Pretensão salarial mín. (R$) <small>(opcional)</small><input name="radar_salario_min" type="number" min="0" defaultValue={inicial.salarioMin ?? ""} placeholder="2500" /></label>
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
            <input type="checkbox" name="consentimento" defaultChecked={inicial.ativo} style={{ marginTop: 3 }} />
            <span>
              Autorizo o envio de alertas de vagas compatíveis pelo WhatsApp, conforme a{" "}
              <a href="/privacidade" style={{ color: "var(--accent)" }}>Política de Privacidade</a> (LGPD).
              Posso revogar a qualquer momento desativando o Radar.
            </span>
          </label>
        </>
      )}

      {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}
      {state?.ok && <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Radar atualizado!</p>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Salvando…" : "Salvar Radar"}</button>
    </form>
  );
}
