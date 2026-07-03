"use client";
import { useActionState, useState } from "react";
import { Icon } from "@/components/Icon";
import { createVaga } from "@/app/painel-empresa/actions";
import { AREAS, CIDADES, MODALIDADES, TIPOS } from "@/lib/refs";

const VAZIO = {
  titulo: "", area: "", cidade: "", modalidade: "", experiencia: "",
  salario_min: "", salario_max: "", descricao: "", requisitos: "", beneficios: "",
  prazo: "", filtro_pergunta: "",
};

export function NovaVagaForm() {
  const [state, formAction, pending] = useActionState(createVaga, undefined);
  const [form, setForm] = useState(VAZIO);
  const [brief, setBrief] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaErro, setIaErro] = useState<string | null>(null);

  const set = (k: keyof typeof VAZIO) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const gerarComIa = async () => {
    setIaErro(null);
    setIaLoading(true);
    try {
      const res = await fetch("/empregos/api/ia/criar-vaga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.erro || "Falha ao gerar.");
      setForm((f) => ({
        ...f,
        titulo: data.titulo ?? f.titulo,
        area: data.area ?? f.area,
        modalidade: data.modalidade ?? f.modalidade,
        experiencia: data.experiencia ?? f.experiencia,
        salario_min: String(data.salario_min ?? ""),
        salario_max: String(data.salario_max ?? ""),
        descricao: data.descricao ?? f.descricao,
        requisitos: Array.isArray(data.requisitos) ? data.requisitos.join("\n") : f.requisitos,
        beneficios: Array.isArray(data.beneficios) ? data.beneficios.join("\n") : f.beneficios,
        filtro_pergunta: data.filtro_pergunta ?? f.filtro_pergunta,
      }));
    } catch (e) {
      setIaErro(e instanceof Error ? e.message : "Falha ao gerar.");
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <form action={formAction} className="vaga-form">
      <div className="ia-assist">
        <label>
          <span className="ia-assist-title"><Icon name="bolt" size={15} /> Criar com IA</span>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={2}
            placeholder="Descreva a vaga em uma frase. Ex.: Vendedor externo para nossa rede de supermercados em Sarandi, com CNH B."
          />
        </label>
        <button type="button" className="btn btn-dark btn-sm" onClick={gerarComIa} disabled={iaLoading || brief.trim().length < 8}>
          {iaLoading ? "Gerando…" : "Gerar campos com IA"}
        </button>
        {iaErro && <p className="auth-erro" role="alert">{iaErro}</p>}
      </div>

      <label>Título da vaga<input name="titulo" required value={form.titulo} onChange={set("titulo")} placeholder="Ex.: Analista de Dados Júnior" /></label>

      <div className="vf-row">
        <label>Área
          <select name="area" value={form.area} onChange={set("area")}><option value="">Selecione</option>{AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        </label>
        <label>Cidade
          <select name="cidade" value={form.cidade} onChange={set("cidade")}><option value="">Selecione</option>{CIDADES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </label>
      </div>

      <div className="vf-row">
        <label>Modalidade
          <select name="modalidade" value={form.modalidade} onChange={set("modalidade")}><option value="">Selecione</option>{Object.entries(MODALIDADES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
        </label>
        <label>Experiência
          <select name="experiencia" value={form.experiencia} onChange={set("experiencia")}><option value="">Selecione</option><option>Sem experiência</option><option>Com experiência</option></select>
        </label>
      </div>

      <div className="vf-row">
        <label>Salário mín. (R$)<input name="salario_min" type="number" min="0" value={form.salario_min} onChange={set("salario_min")} placeholder="2500" /></label>
        <label>Salário máx. (R$)<input name="salario_max" type="number" min="0" value={form.salario_max} onChange={set("salario_max")} placeholder="3500" /></label>
      </div>

      <fieldset className="vf-tipos">
        <legend>Tipos de contrato</legend>
        {Object.entries(TIPOS).map(([k, v]) => (
          <label key={k} className="vf-check"><input type="checkbox" name="tipos" value={k} /> {v.label}</label>
        ))}
      </fieldset>

      <label>Descrição<textarea name="descricao" rows={4} value={form.descricao} onChange={set("descricao")} placeholder="O que a pessoa vai fazer no dia a dia." /></label>
      <label>Requisitos <small>(um por linha)</small><textarea name="requisitos" rows={4} value={form.requisitos} onChange={set("requisitos")} placeholder={"Excel avançado\nSQL"} /></label>
      <label>Benefícios <small>(um por linha)</small><textarea name="beneficios" rows={3} value={form.beneficios} onChange={set("beneficios")} placeholder={"Vale-refeição\nPlano de saúde"} /></label>
      <label>Pergunta de triagem (30s) <small>(opcional)</small><textarea name="filtro_pergunta" rows={2} value={form.filtro_pergunta} onChange={set("filtro_pergunta")} placeholder="Pergunta respondida em áudio/vídeo de 30s" /></label>
      <label>Prazo de divulgação<input name="prazo" type="date" value={form.prazo} onChange={set("prazo")} /></label>

      {state?.erro && <p className="auth-erro" role="alert">{state.erro}</p>}
      <button type="submit" className="btn btn-primary btn-full" disabled={pending}>{pending ? "Publicando…" : "Publicar vaga"}</button>
    </form>
  );
}
