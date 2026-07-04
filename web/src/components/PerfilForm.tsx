"use client";
import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { salvarPerfil } from "@/app/painel-candidato/actions";
import { uploadCurriculo } from "@/lib/storage-upload";
import { maskCPF } from "@/lib/validacao";
import { AREAS, CIDADES } from "@/lib/refs";

type Formacao = { instituicao: string; curso: string; nivel: string; ano: string };
type Experiencia = { empresa: string; cargo: string; periodo: string; descricao: string };

type Inicial = {
  nome: string; area: string; cidade: string; resumo: string; skills: string[];
  curriculoUrl?: string | null; cpf?: string; formacoes?: Formacao[]; experiencias?: Experiencia[]; pontosFortes?: string[];
};

const NIVEIS = ["Ensino médio", "Técnico", "Graduação", "Pós-graduação", "Mestrado / Doutorado"];

export function PerfilForm({ inicial, areas = AREAS, cidades = CIDADES }: { inicial: Inicial; areas?: string[]; cidades?: string[] }) {
  const [state, formAction, pending] = useActionState(salvarPerfil, undefined);
  const [form, setForm] = useState({
    nome: inicial.nome, area: inicial.area, cidade: inicial.cidade,
    resumo: inicial.resumo, skills: inicial.skills.join(", "),
  });
  const [cpf, setCpf] = useState(inicial.cpf ?? "");
  const [cv, setCv] = useState("");
  const [curriculoUrl, setCurriculoUrl] = useState<string>(inicial.curriculoUrl ?? "");
  const [formacoes, setFormacoes] = useState<Formacao[]>(inicial.formacoes ?? []);
  const [experiencias, setExperiencias] = useState<Experiencia[]>(inicial.experiencias ?? []);
  const [pontosFortes, setPontosFortes] = useState<string[]>(inicial.pontosFortes ?? []);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaPerfilLoading, setIaPerfilLoading] = useState(false);
  const [iaErro, setIaErro] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const aplicar = (data: { nome?: string; area?: string; cidade?: string; resumo?: string; skills?: string[] }) =>
    setForm((f) => ({
      ...f,
      nome: data.nome || f.nome, area: data.area || f.area, cidade: data.cidade || f.cidade,
      resumo: data.resumo || f.resumo,
      skills: Array.isArray(data.skills) ? data.skills.join(", ") : f.skills,
    }));

  const extrair = async (payload: { texto?: string; pdfBase64?: string }) => {
    setIaErro(null); setIaLoading(true);
    try {
      const res = await fetch("/empregos/api/ia/extrair-curriculo", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Falha ao extrair.");
      aplicar(data);
    } catch (e) {
      setIaErro(e instanceof Error ? e.message : "Falha ao extrair.");
    } finally { setIaLoading(false); }
  };

  const onPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIaErro(null);
    try { setCurriculoUrl(await uploadCurriculo(file)); }
    catch (err) { setIaErro(err instanceof Error ? err.message : "Falha ao anexar o currículo."); }
    const b64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = reject; r.readAsDataURL(file);
    });
    extrair({ pdfBase64: b64 });
  };

  // RF-38: gera resumo + pontos fortes + sugestões a partir dos dados declarados.
  const gerarPerfil = async () => {
    setIaErro(null); setIaPerfilLoading(true);
    try {
      const res = await fetch("/empregos/api/ia/perfil", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: form.area, resumo: form.resumo,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          formacoes, experiencias,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Falha ao gerar.");
      if (data.resumo) setForm((f) => ({ ...f, resumo: data.resumo }));
      setPontosFortes(data.pontos_fortes ?? []);
      setSugestoes(data.sugestoes ?? []);
    } catch (e) {
      setIaErro(e instanceof Error ? e.message : "Falha ao gerar.");
    } finally { setIaPerfilLoading(false); }
  };

  // Helpers de lista dinâmica.
  const addFormacao = () => setFormacoes((l) => [...l, { instituicao: "", curso: "", nivel: "", ano: "" }]);
  const setFormacao = (i: number, k: keyof Formacao, v: string) => setFormacoes((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const delFormacao = (i: number) => setFormacoes((l) => l.filter((_, j) => j !== i));
  const addExp = () => setExperiencias((l) => [...l, { empresa: "", cargo: "", periodo: "", descricao: "" }]);
  const setExp = (i: number, k: keyof Experiencia, v: string) => setExperiencias((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const delExp = (i: number) => setExperiencias((l) => l.filter((_, j) => j !== i));

  const inputRow: React.CSSProperties = { padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 13, width: "100%" };

  return (
    <form action={formAction} className="vaga-form">
      <div className="ia-assist">
        <label>
          <span className="ia-assist-title"><Icon name="doc" size={15} /> Preencher com seu currículo (IA)</span>
          <textarea value={cv} onChange={(e) => setCv(e.target.value)} rows={3} placeholder="Cole aqui o texto do seu currículo ou do seu LinkedIn…" />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => extrair({ texto: cv })} disabled={iaLoading || cv.trim().length < 30}>
            {iaLoading ? "Extraindo…" : "Extrair do texto"}
          </button>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            <Icon name="upload" size={15} /> Enviar currículo (PDF)
            <input type="file" accept="application/pdf" onChange={onPdf} style={{ display: "none" }} disabled={iaLoading} />
          </label>
          {curriculoUrl && <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>✓ Currículo anexado</span>}
        </div>
        {iaErro && <p className="auth-erro" role="alert">{iaErro}</p>}
      </div>
      <input type="hidden" name="curriculo_url" value={curriculoUrl} />

      <label>Nome<input name="nome" value={form.nome} onChange={set("nome")} required /></label>
      <div className="vf-row">
        <label>CPF<input name="cpf" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" /></label>
        <label>Área
          <select name="area" value={form.area} onChange={set("area")}><option value="">Selecione</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        </label>
      </div>
      <div className="vf-row">
        <label>Cidade
          <select name="cidade" value={form.cidade} onChange={set("cidade")}><option value="">Selecione</option>{cidades.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
      </div>

      {/* Formação acadêmica (múltipla) */}
      <fieldset style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
        <legend style={{ fontSize: 13, fontWeight: 600, padding: "0 6px" }}>Formação acadêmica</legend>
        <div style={{ display: "grid", gap: 10 }}>
          {formacoes.map((f, i) => (
            <div key={i} style={{ display: "grid", gap: 6, border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              <input style={inputRow} placeholder="Instituição" value={f.instituicao} onChange={(e) => setFormacao(i, "instituicao", e.target.value)} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <input style={{ ...inputRow, flex: 2, minWidth: 160 }} placeholder="Curso" value={f.curso} onChange={(e) => setFormacao(i, "curso", e.target.value)} />
                <select style={{ ...inputRow, flex: 1, minWidth: 130 }} value={f.nivel} onChange={(e) => setFormacao(i, "nivel", e.target.value)}>
                  <option value="">Nível</option>{NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input style={{ ...inputRow, width: 90, flex: "0 0 90px" }} placeholder="Ano" inputMode="numeric" value={f.ano} onChange={(e) => setFormacao(i, "ano", e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => delFormacao(i)} aria-label="Remover formação">×</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addFormacao}><Icon name="plus" size={14} /> Adicionar formação</button>
      </fieldset>
      <input type="hidden" name="formacoes" value={JSON.stringify(formacoes)} />

      {/* Experiência profissional (múltipla) */}
      <fieldset style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
        <legend style={{ fontSize: 13, fontWeight: 600, padding: "0 6px" }}>Experiência profissional</legend>
        <div style={{ display: "grid", gap: 10 }}>
          {experiencias.map((x, i) => (
            <div key={i} style={{ display: "grid", gap: 6, border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <input style={{ ...inputRow, flex: 2, minWidth: 160 }} placeholder="Empresa" value={x.empresa} onChange={(e) => setExp(i, "empresa", e.target.value)} />
                <input style={{ ...inputRow, flex: 2, minWidth: 160 }} placeholder="Cargo" value={x.cargo} onChange={(e) => setExp(i, "cargo", e.target.value)} />
                <input style={{ ...inputRow, flex: 1, minWidth: 120 }} placeholder="Período (ex.: 2021–2024)" value={x.periodo} onChange={(e) => setExp(i, "periodo", e.target.value)} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => delExp(i)} aria-label="Remover experiência">×</button>
              </div>
              <textarea style={inputRow} rows={2} placeholder="O que você fazia" value={x.descricao} onChange={(e) => setExp(i, "descricao", e.target.value)} />
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addExp}><Icon name="plus" size={14} /> Adicionar experiência</button>
      </fieldset>
      <input type="hidden" name="experiencias" value={JSON.stringify(experiencias)} />

      <label>Resumo profissional<textarea name="resumo" value={form.resumo} onChange={set("resumo")} rows={4} placeholder="2-3 frases sobre você." /></label>
      <label>Competências <small>(separadas por vírgula)</small><textarea name="skills" value={form.skills} onChange={set("skills")} rows={2} placeholder="Excel, Atendimento, Vendas" /></label>

      {/* Perfil de IA (RF-38) */}
      <div className="ia-assist">
        <button type="button" className="btn btn-dark btn-sm" onClick={gerarPerfil} disabled={iaPerfilLoading}>
          {iaPerfilLoading ? "Gerando perfil…" : "✨ Gerar perfil com IA"}
        </button>
        {pontosFortes.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <strong>Pontos fortes:</strong>
            <ul style={{ margin: "4px 0 0 18px" }}>{pontosFortes.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        )}
        {sugestoes.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-60)" }}>
            <strong>Sugestões para melhorar seu perfil:</strong>
            <ul style={{ margin: "4px 0 0 18px" }}>{sugestoes.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
      <input type="hidden" name="pontos_fortes" value={JSON.stringify(pontosFortes)} />

      {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}
      {state?.ok && <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Perfil salvo!</p>}
      <button type="submit" className="btn btn-primary btn-full" disabled={pending}>{pending ? "Salvando…" : "Salvar perfil"}</button>
    </form>
  );
}
