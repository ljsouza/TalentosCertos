"use client";
import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { salvarPerfil } from "@/app/painel-candidato/actions";
import { uploadCurriculo } from "@/lib/storage-upload";
import { AREAS, CIDADES } from "@/lib/refs";

type Inicial = { nome: string; area: string; cidade: string; resumo: string; skills: string[]; curriculoUrl?: string | null };

export function PerfilForm({ inicial, areas = AREAS, cidades = CIDADES }: { inicial: Inicial; areas?: string[]; cidades?: string[] }) {
  const [state, formAction, pending] = useActionState(salvarPerfil, undefined);
  const [form, setForm] = useState({
    nome: inicial.nome, area: inicial.area, cidade: inicial.cidade,
    resumo: inicial.resumo, skills: inicial.skills.join(", "),
  });
  const [cv, setCv] = useState("");
  const [curriculoUrl, setCurriculoUrl] = useState<string>(inicial.curriculoUrl ?? "");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaErro, setIaErro] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const aplicar = (data: { nome?: string; area?: string; cidade?: string; resumo?: string; skills?: string[] }) =>
    setForm((f) => ({
      ...f,
      nome: data.nome || f.nome,
      area: data.area || f.area,
      cidade: data.cidade || f.cidade,
      resumo: data.resumo || f.resumo,
      skills: Array.isArray(data.skills) ? data.skills.join(", ") : f.skills,
    }));

  const extrair = async (payload: { texto?: string; pdfBase64?: string }) => {
    setIaErro(null);
    setIaLoading(true);
    try {
      const res = await fetch("/empregos/api/ia/extrair-curriculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Falha ao extrair.");
      aplicar(data);
    } catch (e) {
      setIaErro(e instanceof Error ? e.message : "Falha ao extrair.");
    } finally {
      setIaLoading(false);
    }
  };

  const onPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Anexa o PDF no Storage (currículo oficial) e, em paralelo, extrai o perfil via IA.
    setIaErro(null);
    try {
      const path = await uploadCurriculo(file);
      setCurriculoUrl(path);
    } catch (err) {
      setIaErro(err instanceof Error ? err.message : "Falha ao anexar o currículo.");
    }
    const b64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    extrair({ pdfBase64: b64 });
  };

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
        <label>Área
          <select name="area" value={form.area} onChange={set("area")}><option value="">Selecione</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        </label>
        <label>Cidade
          <select name="cidade" value={form.cidade} onChange={set("cidade")}><option value="">Selecione</option>{cidades.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
      </div>
      <label>Resumo profissional<textarea name="resumo" value={form.resumo} onChange={set("resumo")} rows={4} placeholder="2-3 frases sobre você." /></label>
      <label>Competências <small>(separadas por vírgula)</small><textarea name="skills" value={form.skills} onChange={set("skills")} rows={2} placeholder="Excel, Atendimento, Vendas" /></label>

      {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}
      {state?.ok && <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>Perfil salvo!</p>}
      <button type="submit" className="btn btn-primary btn-full" disabled={pending}>{pending ? "Salvando…" : "Salvar perfil"}</button>
    </form>
  );
}
