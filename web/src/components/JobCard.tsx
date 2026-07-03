"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ShareMenu } from "@/components/ShareMenu";
import { Money, TypeBadge, ModalidadeBadge, RespondeBadge, MatchRing, CompanyMark } from "@/components/ui";
import { tempoRelativo } from "@/lib/refs";
import { toggleSalvar } from "@/app/vaga/actions";
import type { VagaComEmpresa } from "@/data/types";

type Props = {
  vaga: VagaComEmpresa;
  density?: "regular" | "compact";
  saved?: boolean;
  // candidato logado pode salvar (DB); anônimo é levado ao login.
  podeSalvar?: boolean;
  // match candidato↔vaga só existe com login (v4.0). Sem auth na v0 → oculto.
  logado?: boolean;
  match?: number;
};

export function JobCard({ vaga, density = "regular", saved, podeSalvar = false, logado = false, match }: Props) {
  const router = useRouter();
  const e = vaga.empresa;
  const path = `/vaga/${vaga.id}`;
  const open = () => router.push(path);
  const ringSize = density === "compact" ? 40 : 46;
  // Links reais (crawláveis) param a propagação para não disparar o onClick do card.
  const stop = (ev: React.MouseEvent) => ev.stopPropagation();

  return (
    <article className={`jobcard ${density} ${vaga.destaque ? "is-feat" : ""}`} onClick={open}>
      {vaga.destaque && <span className="feat-flag"><Icon name="star" size={12} stroke={2} /> Destaque</span>}
      <div className="jc-top">
        <CompanyMark empresa={e} size={density === "compact" ? 38 : 46} />
        <div className="jc-headings">
          <h3 className="jc-title"><Link href={path} onClick={stop} style={{ color: "inherit", textDecoration: "none" }}>{vaga.titulo}</Link></h3>
          <div className="jc-co">{e?.nome}{e?.verificada && <Icon name="shield" size={13} style={{ color: "var(--accent)" }} />}</div>
        </div>
        {logado && match != null && <MatchRing value={match} size={ringSize} />}
      </div>
      <div className="jc-meta">
        <span><Icon name="pin" size={15} /> {vaga.cidade}</span>
        <span><Icon name="clock" size={15} /> {tempoRelativo(vaga.criado_em)}</span>
      </div>
      {density !== "compact" && <p className="jc-desc">{vaga.descricao}</p>}
      <div className="jc-foot">
        <div className="jc-sal"><Money min={vaga.salario_min} max={vaga.salario_max} /></div>
        <div className="jc-chips">
          {vaga.modalidade && <ModalidadeBadge modalidade={vaga.modalidade} />}
          {vaga.tipos.map((t) => <TypeBadge key={t} tipo={t} />)}
          {vaga.filtro_formato && <span className="chip chip-arf"><Icon name={vaga.filtro_formato === "video" ? "video" : "mic"} size={12} /> 30s</span>}
        </div>
      </div>
      <div className="jc-actions" onClick={(ev) => ev.stopPropagation()}>
        {e?.responde && <RespondeBadge tempo={e.tempo_resposta} compact />}
        <span className="jc-spacer" />
        <ShareMenu vaga={vaga} up />
        {podeSalvar ? (
          <form action={toggleSalvar}>
            <input type="hidden" name="vagaId" value={vaga.id} />
            <button type="submit" className={`icon-btn ${saved ? "on" : ""}`} aria-label={saved ? "Remover vaga salva" : "Salvar vaga"}>
              <Icon name="bookmark" size={18} stroke={saved ? 0 : 1.7} style={{ fill: saved ? "var(--accent)" : "none" }} />
            </button>
          </form>
        ) : (
          <button className="icon-btn" onClick={() => router.push("/entrar")} aria-label="Entrar para salvar vaga">
            <Icon name="bookmark" size={18} stroke={1.7} style={{ fill: "none" }} />
          </button>
        )}
        <Link href={path} onClick={stop} className="btn btn-ghost btn-sm"><Icon name="arrow" size={16} />Ver vaga</Link>
      </div>
    </article>
  );
}
