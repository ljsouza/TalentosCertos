// Dados de referência (config, não conteúdo de banco) — vindos de data.jsx.
// Áreas/cidades/tipos/modalidades são taxonomias fixas do produto.

export const MODALIDADES: Record<string, { label: string; icon: string }> = {
  presencial: { label: "Presencial", icon: "building" },
  hibrido: { label: "Híbrido", icon: "layers" },
  remoto: { label: "Remoto", icon: "globe" },
};

export const TIPOS: Record<string, { label: string }> = {
  pcd: { label: "PCD" },
  estagio: { label: "Estágio" },
  temporario: { label: "Temporário" },
  primeiro: { label: "1º Emprego" },
  aprendiz: { label: "Jovem Aprendiz" },
  home: { label: "Home Office" },
  pj: { label: "PJ" },
  clt: { label: "CLT" },
};

export const AREAS = [
  "Administrativo", "Comercial / Vendas", "Tecnologia / TI", "Saúde",
  "Indústria / Produção", "Logística", "Educação", "Marketing",
  "Construção Civil", "Gastronomia", "Recursos Humanos", "Financeiro",
];

export const CIDADES = [
  "Maringá", "Sarandi", "Paiçandu", "Marialva", "Mandaguari",
  "Mandaguaçu", "Astorga", "Ângulo", "Floresta", "Doutor Camargo",
];

// Logomarcas geométricas de exemplo (fallback até a empresa subir o logo real).
type Marca = { bg: string; fg: string; mark: string; font: string; accent: string };
const MARCAS: Record<string, Marca> = {
  e1: { bg: "#d6322a", fg: "#ffffff", mark: "a", font: "sans", accent: "dot" },
  e2: { bg: "#173e74", fg: "#ffffff", mark: "A", font: "sans", accent: "bar" },
  e3: { bg: "#0098a6", fg: "#ffffff", mark: "S", font: "serif", accent: "ring" },
  e4: { bg: "#0a66c2", fg: "#ffffff", mark: "i", font: "sans", accent: "dot" },
  e5: { bg: "#553421", fg: "#f1e6da", mark: "D", font: "serif", accent: "none" },
  e6: { bg: "#00995d", fg: "#ffffff", mark: "U", font: "sans", accent: "none" },
  e7: { bg: "#f4a52a", fg: "#1a1205", mark: "S", font: "sans", accent: "sun" },
};

// Gera um data-URI SVG para a logomarca de exemplo a partir de uma chave estável.
export function brandLogo(key: string): string {
  const b = MARCAS[key];
  if (!b) return "";
  const fam = b.font === "serif" ? "Georgia,'Times New Roman',serif" : "'Trebuchet MS','Segoe UI',system-ui,sans-serif";
  let accent = "";
  if (b.accent === "dot") accent = `<circle cx="60" cy="20" r="8" fill="${b.fg}"/>`;
  else if (b.accent === "bar") accent = `<rect x="16" y="57" width="48" height="6" rx="3" fill="${b.fg}" opacity="0.8"/>`;
  else if (b.accent === "ring") accent = `<circle cx="40" cy="40" r="29" fill="none" stroke="${b.fg}" stroke-opacity="0.35" stroke-width="4"/>`;
  else if (b.accent === "sun") {
    let rays = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      rays += `<line x1="${(40 + Math.cos(a) * 23).toFixed(1)}" y1="${(40 + Math.sin(a) * 23).toFixed(1)}" x2="${(40 + Math.cos(a) * 31).toFixed(1)}" y2="${(40 + Math.sin(a) * 31).toFixed(1)}"/>`;
    }
    accent = `<g stroke="${b.fg}" stroke-width="4" stroke-linecap="round">${rays}</g>`;
  }
  const fs = b.mark.length > 1 ? 30 : 42;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${b.bg}"/>${accent}<text x="40" y="42" font-family="${fam}" font-size="${fs}" font-weight="700" fill="${b.fg}" text-anchor="middle" dominant-baseline="central">${b.mark}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

export const TRIBUNA_AREAS = ["Design", "Tecnologia", "Engenharia", "Gestão", "Marketing", "Dados"];

// 1.240 → "1,2k" · 18400 → "18k" (igual ao protótipo).
export function fmtN(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + "k" : String(n);
}

// "Hoje" / "Ontem" / "N dias" a partir de uma data ISO (substitui o campo "postada").
export function tempoRelativo(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const dias = Math.floor((hoje.getTime() - d.getTime()) / 86400000);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `${dias} dias`;
}
