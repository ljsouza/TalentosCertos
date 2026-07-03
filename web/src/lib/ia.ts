// IA Cria Vaga (v1.5) — server-only. Gera campos estruturados de uma vaga a
// partir de um briefing curto. Provedor: Google Gemini (trocável).
// Sem GEMINI_API_KEY → mock determinístico, para a feature funcionar em dev.
// Usado apenas pelo Route Handler /api/ia/criar-vaga (contexto de servidor).
import { AREAS } from "@/lib/refs";

export type VagaGerada = {
  titulo: string;
  area: string;
  modalidade: "presencial" | "hibrido" | "remoto";
  experiencia: "Sem experiência" | "Com experiência";
  salario_min: number;
  salario_max: number;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
  filtro_pergunta: string;
};

// gemini-2.5-flash: free tier ativo neste projeto (o 2.0-flash veio com limite 0).
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SCHEMA = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    area: { type: "string", enum: AREAS },
    modalidade: { type: "string", enum: ["presencial", "hibrido", "remoto"] },
    experiencia: { type: "string", enum: ["Sem experiência", "Com experiência"] },
    salario_min: { type: "integer" },
    salario_max: { type: "integer" },
    descricao: { type: "string" },
    requisitos: { type: "array", items: { type: "string" } },
    beneficios: { type: "array", items: { type: "string" } },
    filtro_pergunta: { type: "string" },
  },
  required: ["titulo", "area", "modalidade", "experiencia", "salario_min", "salario_max", "descricao", "requisitos", "beneficios", "filtro_pergunta"],
};

const PROMPT = (brief: string) =>
  `Você é um especialista em RH no Norte do Paraná (região de Maringá). A partir do briefing abaixo, gere os campos de uma vaga de emprego, em português do Brasil, realista para o mercado regional (faixas salariais coerentes com a região). A descrição deve ter 2-3 frases. Gere 3-5 requisitos e 3-5 benefícios objetivos. A pergunta de triagem deve ser respondível em 30 segundos.\n\nBriefing: ${brief}`;

export async function gerarVaga(brief: string): Promise<VagaGerada> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return mock(brief);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(brief) }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error("Gemini: resposta vazia");
  return JSON.parse(txt) as VagaGerada;
}

// Mock determinístico (sem key) — prova o fluxo ponta a ponta.
function mock(brief: string): VagaGerada {
  const titulo = brief.split(/[.\n]/)[0].slice(0, 60) || "Nova vaga";
  return {
    titulo,
    area: "Administrativo",
    modalidade: "presencial",
    experiencia: "Com experiência",
    salario_min: 2200,
    salario_max: 3200,
    descricao: `(rascunho gerado sem IA) ${brief}. Configure GEMINI_API_KEY para gerar com o Gemini.`,
    requisitos: ["Ensino médio completo", "Boa comunicação", "Organização"],
    beneficios: ["Vale-refeição", "Vale-transporte", "Plano de saúde"],
    filtro_pergunta: "Em 30 segundos, conte uma experiência sua relacionada a esta vaga.",
  };
}

// ── Extração de currículo (v1.5) ────────────────────────────────────────────
export type PerfilExtraido = {
  nome: string;
  area: string;
  cidade: string;
  resumo: string;
  skills: string[];
};

const SCHEMA_CV = {
  type: "object",
  properties: {
    nome: { type: "string" },
    area: { type: "string", enum: AREAS },
    cidade: { type: "string" },
    resumo: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
  },
  required: ["nome", "area", "cidade", "resumo", "skills"],
};

const PROMPT_CV =
  "Extraia o perfil profissional do currículo a seguir, em português do Brasil. " +
  "resumo: 2-3 frases em 1ª pessoa. area: a mais aderente da lista. cidade: a cidade do candidato. " +
  "skills: 5-10 competências objetivas. Se algum dado faltar, infira do contexto.";

export async function extrairCurriculo(input: { texto?: string; pdfBase64?: string }): Promise<PerfilExtraido> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return mockCv(input.texto || "");

  const parts: unknown[] = [{ text: PROMPT_CV }];
  if (input.pdfBase64) parts.push({ inline_data: { mime_type: "application/pdf", data: input.pdfBase64 } });
  else parts.push({ text: `Currículo:\n${input.texto || ""}` });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA_CV, temperature: 0.3 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!txt) throw new Error("Gemini: resposta vazia");
  return JSON.parse(txt) as PerfilExtraido;
}

function mockCv(texto: string): PerfilExtraido {
  return {
    nome: "",
    area: "Administrativo",
    cidade: "Maringá",
    resumo: `(rascunho sem IA) ${texto.slice(0, 120)}… Configure GEMINI_API_KEY para extrair com o Gemini.`,
    skills: ["Comunicação", "Trabalho em equipe", "Organização"],
  };
}
