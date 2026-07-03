import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { pubById, tempoLeitura } from "@/data/publicacoes";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pub = await pubById(id);
  if (!pub) return { title: "Artigo não encontrado" };
  const desc = pub.lead ?? pub.titulo;
  return { title: pub.titulo, description: desc, openGraph: { title: pub.titulo, description: desc, type: "article" } };
}

export default async function ArtigoPage({ params }: Props) {
  const { id } = await params;
  const pub = await pubById(id);
  // Só publicações aprovadas são públicas (RLS garante; checa também aqui).
  if (!pub || pub.status !== "aprovada") notFound();

  return (
    <article className="screen artigo" style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <Link className="back" href="/conteudo">
        <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Carreira & RH
      </Link>
      <span className="chapeu" style={{ marginTop: 16, display: "block" }}>{pub.chapeu}</span>
      <h1 style={{ fontSize: 32, margin: "8px 0 12px" }}>{pub.titulo}</h1>
      {pub.lead && <p style={{ fontSize: 18, color: "var(--ink-60)", marginBottom: 12 }}>{pub.lead}</p>}
      <span className="byline">
        {pub.empresa ? `Conteúdo de marca · ${pub.empresa.nome}` : "Redação MaringáPost"} · {tempoLeitura(pub.corpo)} de leitura
      </span>
      <div style={{ marginTop: 24 }}>
        {pub.corpo.map((p, i) => (
          <p key={i} style={{ marginBottom: 16 }}>{p}</p>
        ))}
      </div>
    </article>
  );
}
