"use client";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Money, Btn } from "@/components/ui";
import { aplicarVaga, toggleSalvar } from "@/app/vaga/actions";
import type { VagaComEmpresa } from "@/data/types";

// Aside de candidatura. `jaAplicou`/`jaSalvou` vêm do servidor (banco).
// Candidatar/salvar exige login de candidato — a action redireciona para
// /entrar quando anônimo. Sem auth, o match aparece "bloqueado".
export function VagaApplyCard({ vaga, jaAplicou, jaSalvou, podeSalvar }: { vaga: VagaComEmpresa; jaAplicou: boolean; jaSalvou: boolean; podeSalvar: boolean }) {

  return (
    <div className="apply-card">
      <div className="apply-match apply-match-locked">
        <div className="match-lock-lg" title="Faça login para ver compatibilidade">
          <svg width={58} height={58}>
            <circle cx={29} cy={29} r={26} fill="none" stroke="var(--line)" strokeWidth="4" strokeDasharray="30 134" strokeLinecap="round" />
          </svg>
          <Icon name="bookmark" size={18} stroke={1.5} style={{ color: "var(--ink-40)" }} />
        </div>
        <div>
          <strong style={{ color: "var(--ink-60)" }}>Veja sua compatibilidade</strong>
          <span>Faça login para descobrir</span>
        </div>
      </div>

      <div className="apply-sal"><Money min={vaga.salario_min} max={vaga.salario_max} /></div>

      {jaAplicou ? (
        <div className="applied-ok"><Icon name="check" size={20} stroke={2.4} /> Candidatura enviada!</div>
      ) : (
        <>
          {vaga.filtro_formato && (
            <p className="arf-gate-note">
              <Icon name={vaga.filtro_formato === "video" ? "video" : "mic"} size={14} /> Esta vaga pede uma resposta de 30s para concluir a candidatura.
            </p>
          )}
          <form action={aplicarVaga}>
            <input type="hidden" name="vagaId" value={vaga.id} />
            <Btn full icon="bolt" type="submit">Candidatar em 1 clique</Btn>
          </form>
        </>
      )}

      {podeSalvar ? (
        <form action={toggleSalvar}>
          <input type="hidden" name="vagaId" value={vaga.id} />
          <button type="submit" className={`save-row ${jaSalvou ? "on" : ""}`}>
            <Icon name="bookmark" size={17} /> {jaSalvou ? "Vaga salva" : "Salvar vaga"}
          </button>
        </form>
      ) : (
        <Link href="/entrar" className="save-row">
          <Icon name="bookmark" size={17} /> Entrar para salvar
        </Link>
      )}
    </div>
  );
}
