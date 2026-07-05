// Tipos do domínio — espelham as colunas do schema (supabase/migrations).
// Servem tanto para os mocks quanto para as respostas do Supabase.

export type Modalidade = "presencial" | "hibrido" | "remoto";

export interface Empresa {
  id: string;
  nome: string;
  setor: string | null;
  verificada: boolean;
  responde: boolean;
  tempo_resposta: string | null;
  logo_url: string | null;
  // Ciclo de vida da conta + cobrança manual (só carregados no painel admin;
  // opcionais porque os joins leves dos cards públicos não os buscam).
  status?: "pendente" | "ativa" | "bloqueada";
  pacote_id?: string | null;
}

export interface Vaga {
  id: string;
  empresa_id: string;
  titulo: string;
  area: string | null;
  cidade: string | null;
  modalidade: Modalidade | null;
  tipos: string[];
  salario_min: number | null;
  salario_max: number | null;
  experiencia: string | null;
  descricao: string | null;
  requisitos: string[];
  beneficios: string[];
  filtro_pergunta: string | null;
  filtro_formato: "audio" | "video" | null;
  destaque: boolean;
  status: "aberta" | "encerrada" | "rascunho";
  prazo: string | null;
  criado_em: string;
}

// Perfil institucional completo — espelha todas as colunas de `empresas`.
// Usado só na página pública de perfil e na edição pelo dono (não nos joins
// leves dos cards, que continuam usando `Empresa`).
export interface EmpresaPerfil extends Empresa {
  sobre: string | null;
  sobre_longo: string | null;
  fundada: number | null;
  funcionarios: string | null;
  site: string | null;
  endereco: string | null;
  destaques: string[];
  video_youtube: string | null;
  cnpj?: string | null;
  razao_social?: string | null;
}

// Vaga com a empresa embutida (join) — usada nos cards e no detalhe.
export type VagaComEmpresa = Vaga & { empresa: Empresa | null };

export interface Pacote {
  id: string;
  nome: string;
  preco: number | null;
  periodo: string | null;
  vagas_limite: number | null;
  recursos: string[];
  destaque: boolean;
}

export interface Publicacao {
  id: string;
  empresa_id: string | null;
  chapeu: string | null;
  titulo: string;
  lead: string | null;
  categoria: string | null;
  corpo: string[];
  img_url: string | null;
  keywords: string[];
  status: "pendente" | "aprovada" | "reprovada";
  motivo: string | null;
  publicado_em: string | null;
}

export type PublicacaoComEmpresa = Publicacao & { empresa: Pick<Empresa, "id" | "nome"> | null };

export interface TribunaPost {
  id: string;
  autor_nome: string;
  cargo: string | null;
  area: string | null;
  tipo: string | null;
  titulo: string;
  lead: string | null;
  corpo: string[];
  leituras: number;
  curtidas: number;
  comentarios: number;
  viral: boolean;
  radar: boolean;
  disponivel: boolean;
  publicado_em: string | null;
}
