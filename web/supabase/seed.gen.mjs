// Gera seed.sql a partir do mock real do protótipo (../../data.jsx).
// Roda em Node: `node supabase/seed.gen.mjs > supabase/seed.sql`
// O protótipo expõe os dados via Object.assign(window, {...}); shimamos window.
import { readFileSync } from "node:fs";
import vm from "node:vm";

globalThis.window = {};
const src = readFileSync(new URL("../../data.jsx", import.meta.url), "utf8");
vm.runInThisContext(src);
const { EMPRESAS, VAGAS, PACOTES, PUBLICACOES, TRIBUNA } = globalThis.window;

// ── UUIDs determinísticos por tabela (prefixo hex + índice) ─────────────────
const uid = (prefix, n) =>
  `00000000-0000-0000-0000-${prefix}${String(n).padStart(10, "0")}`;
const empMap = {};
EMPRESAS.forEach((e, i) => (empMap[e.id] = uid("e1", i + 1)));

// ── Helpers de SQL ──────────────────────────────────────────────────────────
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v == null ? "null" : Number(v));
const b = (v) => (v ? "true" : "false");
const arr = (a) =>
  !a || a.length === 0
    ? "'{}'"
    : `ARRAY[${a.map((x) => q(x)).join(",")}]::text[]`;

// "10 jun 2026" → date (ou null)
const MESES = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
const dataPt = (s) => {
  if (!s) return "null";
  const m = String(s).toLowerCase().match(/(\d{1,2})\s+([a-z]{3})\s+(\d{4})/);
  if (!m || !MESES[m[2]]) return "null";
  return `'${m[3]}-${MESES[m[2]]}-${m[1].padStart(2, "0")}'`;
};

const out = [];
out.push("-- seed.sql — GERADO por seed.gen.mjs a partir de data.jsx. Não editar à mão.");
out.push("-- Rodar após 0001_init.sql.\n");

// ── Empresas ────────────────────────────────────────────────────────────────
out.push("insert into empresas (id, nome, setor, sobre, sobre_longo, fundada, funcionarios, site, endereco, verificada, responde, tempo_resposta, destaques, video_youtube) values");
out.push(
  EMPRESAS.map((e) =>
    `  (${empMap[e.id]?q(empMap[e.id]):"null"}, ${q(e.nome)}, ${q(e.setor)}, ${q(e.sobre)}, ${q(e.sobreLongo)}, ${n(e.fundada)}, ${q(e.funcionarios)}, ${q(e.site)}, ${q(e.endereco)}, ${b(e.verificada)}, ${b(e.responde)}, ${q(e.tempoResposta)}, ${arr(e.destaques)}, ${q(e.videoYoutube)})`
  ).join(",\n") + ";\n"
);

// ── Pacotes ─────────────────────────────────────────────────────────────────
out.push("insert into pacotes (nome, preco, periodo, vagas_limite, recursos, destaque) values");
out.push(
  PACOTES.map((p) =>
    `  (${q(p.nome)}, ${n(p.preco)}, ${q(p.periodo)}, ${n(p.vagasLimite)}, ${arr(p.recursos)}, ${b(p.destaque)})`
  ).join(",\n") + ";\n"
);

// ── Vagas ───────────────────────────────────────────────────────────────────
out.push("insert into vagas (empresa_id, titulo, area, cidade, modalidade, tipos, salario_min, salario_max, experiencia, descricao, requisitos, beneficios, filtro_pergunta, filtro_formato, destaque, status, prazo) values");
out.push(
  VAGAS.map((v) =>
    `  (${q(empMap[v.empresa])}, ${q(v.titulo)}, ${q(v.area)}, ${q(v.cidade)}, ${q(v.modalidade)}, ${arr(v.tipos)}, ${n(v.salarioMin)}, ${n(v.salarioMax)}, ${q(v.exp)}, ${q(v.descricao)}, ${arr(v.requisitos)}, ${arr(v.beneficios)}, ${q(v.filtroAtivo?.pergunta)}, ${q(v.filtroAtivo?.formato)}, ${b(v.destaque)}, 'aberta', ${v.prazo ? q(v.prazo) : "null"})`
  ).join(",\n") + ";\n"
);

// ── Publicações ─────────────────────────────────────────────────────────────
out.push("insert into publicacoes (empresa_id, chapeu, titulo, lead, categoria, corpo, img_url, keywords, status, motivo, publicado_em) values");
out.push(
  PUBLICACOES.map((p) =>
    `  (${p.empresa ? q(empMap[p.empresa]) : "null"}, ${q(p.chapeu)}, ${q(p.titulo)}, ${q(p.lead)}, ${q(p.categoria)}, ${arr(p.corpo)}, ${q(p.img)}, ${arr(p.keywords)}, ${q(p.status)}, ${q(p.motivo)}, ${dataPt(p.data)})`
  ).join(",\n") + ";\n"
);

// ── Tribuna ─────────────────────────────────────────────────────────────────
out.push("insert into tribuna (autor_nome, cargo, area, tipo, titulo, lead, corpo, leituras, curtidas, comentarios, viral, radar, disponivel, publicado_em) values");
out.push(
  TRIBUNA.map((t) =>
    `  (${q(t.autor)}, ${q(t.cargo)}, ${q(t.area)}, ${q(t.tipo)}, ${q(t.titulo)}, ${q(t.lead)}, ${arr(t.corpo)}, ${n(t.leituras)}, ${n(t.curtidas)}, ${n(t.comentarios)}, ${b(t.viral)}, ${b(t.radar)}, ${b(t.disponivel)}, ${dataPt(t.data)})`
  ).join(",\n") + ";\n"
);

process.stdout.write(out.join("\n"));
