import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getPacotes } from "@/data/pacotes";

export const metadata: Metadata = {
  title: "Planos para empresas",
  description: "Pacotes para publicar vagas no MaringáPost Empregos — sem taxa por candidato.",
};

export default async function PacotesPage() {
  const pacotes = await getPacotes();

  return (
    <div className="screen pacotes">
      <div className="pacotes-head">
        <span className="chapeu">Planos para empresas</span>
        <h1>Contrate com a audiência e a credibilidade do MaringáPost.</h1>
        <p>Sem taxa por candidato. Cancele quando quiser. Todos os planos incluem o selo de empresa verificada.</p>
      </div>
      <div className="plans">
        {pacotes.map((p) => {
          const vagasTxt = p.vagas_limite ? `${p.vagas_limite} vagas por mês` : "Vagas ilimitadas";
          const cta = p.preco == null ? "Falar com vendas" : p.destaque ? "Mais popular" : "Começar agora";
          const amp = p.destaque ? "Amplificação Alcance MaringáPost" : p.preco == null ? "Amplificação total + campanha editorial" : null;
          return (
            <div key={p.id} className={`plan ${p.destaque ? "feat" : ""}`}>
              {p.destaque && <span className="plan-flag">Mais popular</span>}
              <h3>{p.nome}</h3>
              <div className="plan-price">
                {p.preco ? <><span className="cur">R$</span><strong>{p.preco}</strong><span className="per">{p.periodo}</span></> : <strong className="consult">Sob consulta</strong>}
              </div>
              <span className="plan-vagas">{vagasTxt}</span>
              {amp && <span className="plan-amp"><Icon name="bolt" size={13} /> {amp}</span>}
              <ul>{p.recursos.map((r, i) => <li key={i}><Icon name="check" size={15} stroke={2.4} /> {r}</li>)}</ul>
              <Link href="/empresa" className={`btn btn-full ${p.destaque ? "btn-primary" : "btn-ghost"}`}>{cta}</Link>
            </div>
          );
        })}
      </div>
      <div className="pacotes-foot">
        <div className="pf-item"><Icon name="shield" size={22} /><div><strong>Verificação de CNPJ</strong><span>Toda empresa passa por checagem antes de publicar.</span></div></div>
        <div className="pf-item"><Icon name="chart" size={22} /><div><strong>Relatórios reais</strong><span>Acompanhe visualizações, candidatos e conversão.</span></div></div>
        <div className="pf-item"><Icon name="bolt" size={22} /><div><strong>Suporte humano</strong><span>Time de Maringá, no horário comercial.</span></div></div>
      </div>
    </div>
  );
}
