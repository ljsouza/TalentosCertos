"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { JobCard } from "@/components/JobCard";
import { Btn, SectionHead } from "@/components/ui";
import { AREAS, CIDADES } from "@/lib/refs";
import type { VagaComEmpresa } from "@/data/types";

export function HomeClient({ vagas, savedIds, isCandidato }: { vagas: VagaComEmpresa[]; savedIds: string[]; isCandidato: boolean }) {
  const router = useRouter();
  const saved = new Set(savedIds);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [cidade, setCidade] = useState("");
  const [sort, setSort] = useState<"recente" | "salario">("recente");

  const list = useMemo(() => {
    let l = vagas.filter(
      (v) =>
        (!q || (v.titulo + (v.descricao || "")).toLowerCase().includes(q.toLowerCase())) &&
        (!area || v.area === area) &&
        (!cidade || v.cidade === cidade)
    );
    l = [...l].sort((a, b) =>
      sort === "salario"
        ? (b.salario_min || 0) - (a.salario_min || 0)
        : new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
    return l;
  }, [vagas, q, area, cidade, sort]);

  const totalEmpresas = new Set(vagas.map((v) => v.empresa_id)).size;

  return (
    <div className="screen">
      <section className="hero">
        <div className="hero-inner">
          <span className="chapeu">Portal de Empregos · Maringá e região</span>
          <h1 className="hero-title">O trabalho certo tem endereço aqui.</h1>
          <p className="hero-sub">Vagas verificadas, empresas que respondem e o jornalismo do MaringáPost sobre carreira — em um só lugar.</p>
          <div className="searchbar">
            <div className="sb-field grow">
              <Icon name="search" size={20} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cargo, palavra-chave ou empresa" />
            </div>
            <div className="sb-field">
              <Icon name="pin" size={18} />
              <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
                <option value="">Toda a região</option>
                {CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Btn icon="search">Buscar</Btn>
          </div>
          <div className="hero-stats">
            <span><strong>{vagas.length}</strong> vagas abertas</span>
            <span className="dot" />
            <span><strong>{totalEmpresas}</strong> empresas</span>
          </div>
        </div>
      </section>

      <div className="area-rail">
        <button className={`pill ${!area ? "on" : ""}`} onClick={() => setArea("")}>Todas as áreas</button>
        {AREAS.slice(0, 8).map((a) => (
          <button key={a} className={`pill ${area === a ? "on" : ""}`} onClick={() => setArea(a === area ? "" : a)}>{a}</button>
        ))}
      </div>

      <section className="results-wrap">
        <div className="results-main">
          <div className="results-bar">
            <h2 className="results-count">{list.length} vagas {area && `em ${area}`}{cidade && ` · ${cidade}`}</h2>
            <div className="sort">
              <span>Ordenar:</span>
              <button className={sort === "recente" ? "on" : ""} onClick={() => setSort("recente")}>Recentes</button>
              <button className={sort === "salario" ? "on" : ""} onClick={() => setSort("salario")}>Maior salário</button>
            </div>
          </div>
          <div className="job-grid regular">
            {list.map((v) => (
              <JobCard key={v.id} vaga={v} saved={saved.has(v.id)} podeSalvar={isCandidato} />
            ))}
          </div>
        </div>

        <aside className="results-aside">
          <div className="aside-card map-card">
            <SectionHead chapeu="Novidade" titulo="Vagas no mapa" />
            <div className="minimap">
              <div className="minimap-grid" />
              {[{ x: 30, y: 35, n: 14 }, { x: 62, y: 28, n: 9 }, { x: 48, y: 58, n: 22 }, { x: 75, y: 62, n: 6 }, { x: 22, y: 70, n: 11 }].map((p, i) => (
                <span key={i} className="map-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.n}</span>
              ))}
              <span className="minimap-cap"><Icon name="map" size={15} /> 9 regiões de Maringá</span>
            </div>
          </div>
          <div className="aside-card cta-card">
            <h3>É uma empresa?</h3>
            <p>Publique vagas, ganhe o selo de verificada e alcance os melhores talentos da região.</p>
            <Btn variant="primary" full icon="arrow" onClick={() => router.push("/pacotes")}>Ver planos</Btn>
          </div>
        </aside>
      </section>
    </div>
  );
}
