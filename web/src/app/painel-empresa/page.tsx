import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NovaVagaForm } from "@/components/NovaVagaForm";
import { PerfilEmpresaForm } from "@/components/PerfilEmpresaForm";
import { requireEmpresa } from "@/lib/auth";
import { encerrarVaga } from "@/app/painel-empresa/actions";
import type { Vaga, EmpresaPerfil } from "@/data/types";

export const metadata: Metadata = { title: "Painel da empresa" };

export default async function PainelEmpresaPage() {
  const { empresa, perfil, supabase } = await requireEmpresa();

  let vagas: Vaga[] = [];
  if (empresa) {
    const { data } = await supabase
      .from("vagas")
      .select("*")
      .eq("empresa_id", empresa.id)
      .order("criado_em", { ascending: false });
    vagas = (data as Vaga[]) || [];
  }

  return (
    <div className="screen" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <span className="chapeu">Painel da empresa</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", margin: "6px 0 24px" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>{empresa?.nome || perfil?.nome}</h1>
        {empresa?.verificada && <span className="verif"><Icon name="shield" size={13} /> Verificada</span>}
        {empresa && <Link href={`/empresa-perfil/${empresa.id}`} className="btn btn-ghost btn-sm"><Icon name="eye" size={15} /> Ver perfil público</Link>}
      </div>

      <div className="painel-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 32, alignItems: "start" }}>
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Suas vagas ({vagas.length})</h2>
          {vagas.length === 0 ? (
            <p style={{ color: "var(--ink-60)" }}>Nenhuma vaga publicada ainda. Use o formulário ao lado para criar a primeira.</p>
          ) : (
            <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
              {vagas.map((v) => (
                <li key={v.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/vaga/${v.id}`} style={{ fontWeight: 600 }}>{v.titulo}</Link>
                    <div style={{ color: "var(--ink-60)", fontSize: 13 }}>{v.cidade} · {v.modalidade} · <span style={{ textTransform: "capitalize" }}>{v.status}</span></div>
                  </div>
                  {v.status === "aberta" && (
                    <form action={encerrarVaga}>
                      <input type="hidden" name="id" value={v.id} />
                      <button type="submit" className="btn btn-ghost btn-sm">Encerrar</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}><Icon name="plus" size={18} /> Publicar nova vaga</h2>
          <NovaVagaForm />
        </section>
      </div>

      {empresa && (
        <section style={{ marginTop: 40, maxWidth: 640 }}>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}><Icon name="building" size={18} /> Perfil da empresa</h2>
          <p style={{ color: "var(--ink-60)", fontSize: 13.5, marginBottom: 16 }}>
            Estas informações aparecem no seu perfil público e ajudam candidatos a confiar na sua marca.
            O selo de empresa verificada é concedido pela equipe do MaringáPost.
          </p>
          <PerfilEmpresaForm empresa={empresa as EmpresaPerfil} />
        </section>
      )}
    </div>
  );
}
