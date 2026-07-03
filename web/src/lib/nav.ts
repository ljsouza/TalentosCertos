// Configuração de navegação (vinda de app.jsx).
// href(): home → "/", demais → "/{id}".
export const href = (id: string) => (id === "home" ? "/" : `/${id}`);

// Atalhos no topo.
export const PRIMARY_NAV = [
  { id: "home", label: "Vagas" },
  { id: "express", label: "Na Hora" },
  { id: "senior", label: "Talento 50+" },
  { id: "inclusao", label: "Inclusão" },
  { id: "desafios", label: "Desafios" },
  { id: "tribuna", label: "Tribuna" },
  { id: "conteudo", label: "Carreira & RH" },
  { id: "pacotes", label: "Para empresas" },
];

// Diretório completo (drawer do botão Menu).
export const MENU_GROUPS = [
  {
    titulo: "Vagas & Talentos",
    itens: [
      { id: "home", label: "Vagas", desc: "Todas as vagas verificadas da região", icon: "search" },
      { id: "express", label: "Na Hora", desc: "Vagas com contratação imediata", icon: "bolt" },
      { id: "senior", label: "Talento 50+", desc: "Experiência sênior para projetos e mentorias", icon: "users" },
      { id: "inclusao", label: "Inclusão", desc: "Vagas afirmativas para PCD", icon: "shield" },
      { id: "desafios", label: "Desafios", desc: "Recrutamento por provas práticas", icon: "bolt" },
    ],
  },
  {
    titulo: "Conteúdo & Comunidade",
    itens: [
      { id: "tribuna", label: "Tribuna do Talento", desc: "Conteúdo publicado por profissionais", icon: "chat" },
      { id: "conteudo", label: "Carreira & RH", desc: "Jornalismo e guias de carreira", icon: "doc" },
    ],
  },
  {
    titulo: "Para empresas",
    itens: [
      { id: "pacotes", label: "Planos", desc: "Pacotes para publicar vagas", icon: "layers" },
      { id: "empresa", label: "Publicar vaga", desc: "Área da empresa e painel", icon: "building" },
    ],
  },
];
