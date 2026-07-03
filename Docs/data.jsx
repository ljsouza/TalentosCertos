// data.jsx — mock content for the MaringáPost Empregos prototype
// Exposed on window for the other Babel scripts.

const MODALIDADES = {
  presencial: { label: "Presencial",  icon: "building" },
  hibrido:    { label: "Híbrido",     icon: "layers"   },
  remoto:     { label: "Remoto",      icon: "globe"    },
};

const TIPOS = {
  pcd: { label: "PCD", icon: "♿" },
  estagio: { label: "Estágio", icon: "🎓" },
  temporario: { label: "Temporário", icon: "⏳" },
  primeiro: { label: "1º Emprego", icon: "🌱" },
  aprendiz: { label: "Jovem Aprendiz", icon: "📘" },
  home: { label: "Home Office", icon: "🏠" },
  pj: { label: "PJ", icon: "📄" },
  clt: { label: "CLT", icon: "📋" },
};

const AREAS = [
  "Administrativo", "Comercial / Vendas", "Tecnologia / TI", "Saúde",
  "Indústria / Produção", "Logística", "Educação", "Marketing",
  "Construção Civil", "Gastronomia", "Recursos Humanos", "Financeiro",
];

const CIDADES = [
  "Maringá", "Sarandi", "Paiçandu", "Marialva", "Mandaguari",
  "Mandaguaçu", "Astorga", "Ângulo", "Floresta", "Doutor Camargo",
];

// Empresas (recrutadores)
const EMPRESAS = [
  { id: "e1", nome: "Grupo Amigão", setor: "Varejo / Supermercados", logoTint: "150 0.10", responde: true, tempoResposta: "2 dias", vagasAbertas: 14, verificada: true, sobre: "Rede de supermercados com forte presença no Norte do Paraná.", fundada: 1979, funcionarios: "3.000+", site: "grupoamigao.com.br", endereco: "Maringá e região, PR", sobreLongo: "Uma das maiores redes de supermercados do Norte do Paraná, o Grupo Amigão emprega milhares de pessoas e investe na formação de jovens para o varejo regional.", destaques: ["Mais de 40 anos de história", "Programa Jovem Aprendiz", "Plano de carreira no varejo"], videoYoutube: "l87XMwb4KM8" },
  { id: "e2", nome: "Apitec Engenharia", setor: "Indústria / Engenharia", logoTint: "250 0.10", responde: true, tempoResposta: "4 dias", vagasAbertas: 6, verificada: true, sobre: "Soluções em automação e montagem elétrica industrial.", fundada: 2005, funcionarios: "120", site: "apitec.com.br", endereco: "Maringá, PR", sobreLongo: "Especialista em automação e montagem elétrica industrial, a Apitec entrega projetos de engenharia para indústrias de todo o Sul do Brasil, com um time técnico de alto nível.", destaques: ["Projetos de automação industrial", "Ambiente técnico de ponta", "Eleita ótimo lugar para trabalhar"], videoYoutube: "l87XMwb4KM8" },
  { id: "e3", nome: "Sabin Diagnóstica", setor: "Saúde", logoTint: "20 0.12", responde: true, tempoResposta: "1 dia", vagasAbertas: 9, verificada: true, sobre: "Medicina diagnóstica de referência nacional.", fundada: 1984, funcionarios: "7.000+", site: "sabin.com.br", endereco: "Maringá, PR", sobreLongo: "Referência nacional em medicina diagnóstica, o Sabin é reconhecido pela cultura de pessoas e por programas estruturados de desenvolvimento de lideranças.", destaques: ["Top 10 melhores empresas para trabalhar", "Formação de líderes", "Saúde e bem-estar"], videoYoutube: "l87XMwb4KM8" },
  { id: "e4", nome: "Ired Telecom", setor: "Tecnologia / Telecom", logoTint: "200 0.12", responde: false, tempoResposta: "—", vagasAbertas: 4, verificada: true, sobre: "Provedora de tecnologia e telecom para empresas.", fundada: 2012, funcionarios: "80", site: "iredtelecom.com.br", endereco: "Maringá, PR", sobreLongo: "Provedora de tecnologia e telecom corporativa, a Ired conecta negócios da região com infraestrutura própria de fibra e times de engenharia e suporte.", destaques: ["Infraestrutura própria de fibra", "Engenharia e suporte locais", "Crescimento acelerado"], videoYoutube: "l87XMwb4KM8" },
  { id: "e5", nome: "Dengo Cafeteria", setor: "Gastronomia", logoTint: "60 0.10", responde: true, tempoResposta: "3 dias", vagasAbertas: 3, verificada: false, sobre: "Cafeteria e chocolateria artesanal.", fundada: 2017, funcionarios: "45", site: "dengocafe.com.br", endereco: "Maringá, PR", sobreLongo: "Cafeteria e chocolateria artesanal que valoriza origem, afeto e o trabalho de quem faz o dia a dia acontecer no balcão e na cozinha.", destaques: ["Produção artesanal", "Abertura a 1º emprego", "Ambiente acolhedor"], videoYoutube: "l87XMwb4KM8" },
  { id: "e6", nome: "Unimed Maringá", setor: "Saúde", logoTint: "150 0.12", responde: true, tempoResposta: "2 dias", vagasAbertas: 11, verificada: true, sobre: "Cooperativa de trabalho médico.", fundada: 1971, funcionarios: "2.500+", site: "unimedmaringa.com.br", endereco: "Maringá, PR", sobreLongo: "Cooperativa de trabalho médico, a Unimed Maringá cuida de pessoas — e investe igualmente no bem-estar de quem cuida, com benefícios e planos de carreira.", destaques: ["Maior operadora de saúde da região", "Benefícios de saúde mental", "Plano de carreira em saúde"], videoYoutube: "l87XMwb4KM8" },
  { id: "e7", nome: "Solis Energia", setor: "Energia renovável", logoTint: "90 0.12", responde: true, tempoResposta: "2 dias", vagasAbertas: 5, verificada: true, sobre: "Projetos e instalação de sistemas fotovoltaicos no Norte do Paraná.", fundada: 2016, funcionarios: "70", site: "solisenergia.com.br", endereco: "Maringá, PR", sobreLongo: "Projetos e instalação de sistemas fotovoltaicos no Norte do Paraná, com treinamento próprio para formar novos profissionais do setor de energia solar em expansão.", destaques: ["Setor em forte expansão", "Treinamento certificado", "Carreira em energia renovável"], videoYoutube: "l87XMwb4KM8" },
];

const empById = (id) => EMPRESAS.find((e) => e.id === id);

// Marcas de exemplo — logomarcas ORIGINAIS (geométricas), não os logos reais das marcas.
// Servem de demonstração e de fallback; o usuário pode arrastar o logo real por cima.
const MARCAS = {
  e1: { bg: "#d6322a", fg: "#ffffff", mark: "a", font: "sans", accent: "dot" },   // Grupo Amigão
  e2: { bg: "#173e74", fg: "#ffffff", mark: "A", font: "sans", accent: "bar" },   // Apitec Engenharia
  e3: { bg: "#0098a6", fg: "#ffffff", mark: "S", font: "serif", accent: "ring" }, // Sabin Diagnóstica
  e4: { bg: "#0a66c2", fg: "#ffffff", mark: "i", font: "sans", accent: "dot" },   // Ired Telecom
  e5: { bg: "#553421", fg: "#f1e6da", mark: "D", font: "serif", accent: "none" }, // Dengo Cafeteria
  e6: { bg: "#00995d", fg: "#ffffff", mark: "U", font: "sans", accent: "none" },  // Unimed Maringá
  e7: { bg: "#f4a52a", fg: "#1a1205", mark: "S", font: "sans", accent: "sun" },   // Solis Energia
};
function brandLogo(id) {
  const b = MARCAS[id];
  if (!b) return "";
  const fam = b.font === "serif" ? "Georgia,'Times New Roman',serif" : "'Trebuchet MS','Segoe UI',system-ui,sans-serif";
  let accent = "";
  if (b.accent === "dot") accent = `<circle cx="60" cy="20" r="8" fill="${b.fg}"/>`;
  else if (b.accent === "bar") accent = `<rect x="16" y="57" width="48" height="6" rx="3" fill="${b.fg}" opacity="0.8"/>`;
  else if (b.accent === "ring") accent = `<circle cx="40" cy="40" r="29" fill="none" stroke="${b.fg}" stroke-opacity="0.35" stroke-width="4"/>`;
  else if (b.accent === "sun") {
    let rays = "";
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      rays += `<line x1="${(40 + Math.cos(a) * 23).toFixed(1)}" y1="${(40 + Math.sin(a) * 23).toFixed(1)}" x2="${(40 + Math.cos(a) * 31).toFixed(1)}" y2="${(40 + Math.sin(a) * 31).toFixed(1)}"/>`;
    }
    accent = `<g stroke="${b.fg}" stroke-width="4" stroke-linecap="round">${rays}</g>`;
  }
  const fs = b.mark.length > 1 ? 30 : 42;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${b.bg}"/>${accent}<text x="40" y="42" font-family="${fam}" font-size="${fs}" font-weight="700" fill="${b.fg}" text-anchor="middle" dominant-baseline="central">${b.mark}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// Vagas
const VAGAS = [
  { id: "v1", titulo: "Analista de Dados Júnior", empresa: "e2", area: "Tecnologia / TI", cidade: "Maringá", modalidade: "remoto", prazo: "2026-06-17", tipos: ["clt", "home"], salarioMin: 3500, salarioMax: 4800, exp: "Com experiência", match: 92, destaque: true, postada: "Hoje", candidatos: 23, filtroAtivo: { pergunta: "Em 30 segundos: qual análise de dados que você fez gerou mais impacto — e por quê?", formato: "audio" }, descricao: "Você vai estruturar dashboards, manter pipelines de dados e apoiar decisões de negócio com análises claras.", requisitos: ["Excel avançado e SQL", "Power BI ou Looker", "Lógica e curiosidade analítica", "Desejável Python"], beneficios: ["Vale-refeição", "Plano de saúde", "Home office híbrido", "Day off de aniversário"] },
  { id: "v2", titulo: "Vendedor(a) Externo", empresa: "e1", area: "Comercial / Vendas", cidade: "Sarandi", modalidade: "presencial", prazo: "2026-06-10", tipos: ["clt"], salarioMin: 2200, salarioMax: 3800, exp: "Com experiência", match: 78, destaque: true, postada: "Hoje", candidatos: 41, descricao: "Atendimento e prospecção de clientes na região metropolitana de Maringá, com carteira ativa.", requisitos: ["CNH categoria B", "Experiência com vendas externas", "Boa comunicação"], beneficios: ["Comissão agressiva", "Combustível", "Vale-refeição"] },
  { id: "v3", titulo: "Técnico(a) de Enfermagem", empresa: "e6", area: "Saúde", cidade: "Maringá", modalidade: "presencial", prazo: "2026-06-25", tipos: ["clt"], salarioMin: 2600, salarioMax: 3100, exp: "Com experiência", match: 64, destaque: false, postada: "Ontem", candidatos: 18, descricao: "Assistência de enfermagem em unidade hospitalar, escala 12x36.", requisitos: ["COREN ativo", "Experiência hospitalar", "Disponibilidade para escala 12x36"], beneficios: ["Plano de saúde", "Vale-transporte", "Refeição no local"] },
  { id: "v4", titulo: "Estágio em Marketing", empresa: "e5", area: "Marketing", cidade: "Maringá", modalidade: "hibrido", prazo: "2026-06-13", tipos: ["estagio", "primeiro"], salarioMin: 1200, salarioMax: 1500, exp: "Sem experiência", match: 85, destaque: false, postada: "Hoje", candidatos: 56, descricao: "Apoio às campanhas, redes sociais e produção de conteúdo da marca.", requisitos: ["Cursando Marketing, Publicidade ou afins", "Familiaridade com redes sociais", "Boa escrita"], beneficios: ["Bolsa-auxílio", "Vale-transporte", "Ambiente jovem"] },
  { id: "v5", titulo: "Assistente de Logística", empresa: "e1", area: "Logística", cidade: "Paiçandu", modalidade: "presencial", prazo: "2026-06-30", tipos: ["clt"], salarioMin: 1900, salarioMax: 2400, exp: "Com experiência", match: 71, destaque: false, postada: "2 dias", candidatos: 30, descricao: "Controle de estoque, conferência de carga e apoio ao centro de distribuição.", requisitos: ["Ensino médio completo", "Experiência com estoque", "Pacote Office básico"], beneficios: ["Vale-refeição", "Vale-transporte", "Plano odontológico"] },
  { id: "v6", titulo: "Desenvolvedor(a) Full-Stack", empresa: "e4", area: "Tecnologia / TI", cidade: "Maringá", modalidade: "remoto", prazo: "2026-06-18", tipos: ["pj", "home"], salarioMin: 6000, salarioMax: 9000, exp: "Com experiência", match: 88, destaque: true, postada: "Hoje", candidatos: 12, filtroAtivo: { pergunta: "Conte, em 30 segundos, um produto que você construiu do zero — e o que faria diferente hoje.", formato: "video" }, descricao: "Construção de produtos web do front ao back, em time enxuto e ágil.", requisitos: ["React e Node", "Banco de dados relacional", "Git e CI/CD", "Inglês técnico"], beneficios: ["100% remoto", "Horário flexível", "Budget de estudos"] },
  { id: "v7", titulo: "Auxiliar de Cozinha", empresa: "e5", area: "Gastronomia", cidade: "Maringá", modalidade: "presencial", prazo: "2026-06-22", tipos: ["clt", "primeiro"], salarioMin: 1600, salarioMax: 1900, exp: "Sem experiência", match: 58, destaque: false, postada: "Ontem", candidatos: 47, descricao: "Apoio no preparo, organização e higienização da cozinha.", requisitos: ["Vontade de aprender", "Disponibilidade de horário", "Trabalho em equipe"], beneficios: ["Refeição no local", "Vale-transporte"] },
  { id: "v8", titulo: "Analista de RH", empresa: "e3", area: "Recursos Humanos", cidade: "Marialva", modalidade: "hibrido", prazo: "2026-07-01", tipos: ["clt"], salarioMin: 3200, salarioMax: 4200, exp: "Com experiência", match: 80, destaque: false, postada: "3 dias", candidatos: 26, descricao: "Recrutamento, seleção e rotinas de departamento pessoal.", requisitos: ["Formação em RH, Psicologia ou Adm", "Experiência com R&S", "eSocial desejável"], beneficios: ["Plano de saúde", "Gympass", "Home office 2x/semana"] },
  { id: "v9", titulo: "Engenheiro(a) de Projetos Fotovoltaicos", empresa: "e7", area: "Indústria / Produção", cidade: "Maringá", modalidade: "presencial", prazo: "2026-06-15", tipos: ["clt"], salarioMin: 7500, salarioMax: 10500, exp: "Com experiência", match: 86, destaque: true, postada: "Hoje", candidatos: 9, descricao: "Dimensionamento e homologação de usinas solares residenciais e comerciais em toda a região.", requisitos: ["Engenharia Elétrica com CREA ativo", "Experiência com projetos fotovoltaicos", "Domínio de AutoCAD e PVsyst", "CNH B"], beneficios: ["Plano de saúde", "Carro da empresa", "Participação nos lucros"] },
  { id: "v10", titulo: "Técnico(a) Instalador(a) Fotovoltaico", empresa: "e7", area: "Indústria / Produção", cidade: "Mandaguari", modalidade: "presencial", prazo: "2026-06-28", tipos: ["clt", "primeiro"], salarioMin: 2800, salarioMax: 3600, exp: "Sem experiência", match: 74, destaque: false, postada: "Ontem", candidatos: 17, descricao: "Instalação e manutenção de sistemas solares, com treinamento completo pela empresa.", requisitos: ["Curso técnico em eletrotécnica ou afins", "NR-10 e NR-35 (ou disposição para tirar)", "Disponibilidade para viagens curtas"], beneficios: ["Treinamento certificado", "Vale-refeição", "Adicional de periculosidade"] },
];

const vagaById = (id) => VAGAS.find((v) => v.id === id);

// Conteúdo de RH (jornalismo + carreira)
const ARTIGOS = [
  { id: "a1", chapeu: "Mercado de trabalho", titulo: "Norte do Paraná lidera abertura de vagas em tecnologia no 1º semestre", lead: "Levantamento aponta crescimento de 18% nas contratações de TI na região metropolitana de Maringá.", autor: "Redação MaringáPost", tempo: "4 min", tag: "Dados" },
  { id: "a2", chapeu: "Carreira", titulo: "Como montar um currículo que passa pelos filtros de IA", lead: "Recrutadores explicam o que realmente importa quando a triagem é automatizada.", autor: "Vítor Santos", tempo: "6 min", tag: "Guia" },
  { id: "a3", chapeu: "Employer branding", titulo: "Por que dar feedback ao candidato virou vantagem competitiva", lead: "Empresas que respondem atraem 3x mais talentos qualificados, mostra pesquisa.", autor: "Redação MaringáPost", tempo: "5 min", tag: "Opinião" },
];

// Pacotes comerciais (empresas)
const PACOTES = [
  { id:"p1", nome:"Atrair",     preco:149,  periodo:"/mês",        destaque:false, vagasLimite:3,    vagas:"3 vagas por mês",
    recursos:["3 vagas publicadas por mês","Publicação por 30 dias","Painel básico de candidatos","Índice de compatibilidade IA","Logo no perfil da empresa","Suporte por e-mail"],
    cta:"Começar agora" },
  { id:"p2", nome:"Conectar",   preco:389,  periodo:"/mês",        destaque:true,  vagasLimite:12,   vagas:"12 vagas por mês",
    recursos:["12 vagas publicadas por mês","Tudo do plano Atrair","Vagas em destaque (até 4 simultâneas)","Filtro de Resposta Ativa","Radar de talentos · 5 convites/mês","Página institucional completa","Publicação editorial · 1/trimestre","Relatórios de desempenho","Suporte prioritário","Selo Empresa Verificada"],
    cta:"Mais popular" },
  { id:"p3", nome:"CrescerPro", preco:null, periodo:"sob consulta", destaque:false, vagasLimite:null, vagas:"Vagas ilimitadas",
    recursos:["Vagas ilimitadas","Tudo do plano Conectar","Vaga Amplificada (multi-canal)","Score de intencionalidade","Radar de talentos ilimitado","Campanha editorial MaringáPost","Gerente de conta dedicado","Integração com ATS","API de vagas"],
    cta:"Falar com vendas" },
];

// Publicações de Carreira & RH — criadas pelas empresas, aprovadas pelo admin
const PUBLICACOES = [
  { id: "pub7", empresa: null, chapeu: "Mercado de trabalho", titulo: "Energia solar cresce 40% em Maringá e região — e faltam profissionais", lead: "Expansão das usinas fotovoltaicas no Norte do Paraná abre disputa por engenheiros, técnicos e instaladores. Empresas oferecem treinamento para quem vem de outras áreas.", categoria: "Reportagem", status: "aprovada", data: "10 jun 2026", tempo: "5 min", img: "images/energia-solar.webp", keywords: ["fotovolta", "solar", "energia"],
    corpo: [
      "O Norte do Paraná vive uma corrida pela energia solar. Levantamento obtido pelo MaringáPost mostra que a potência instalada em sistemas fotovoltaicos na região metropolitana de Maringá cresceu 40% nos últimos doze meses — o dobro da média estadual.",
      "O movimento é puxado por residências e pequenos comércios, mas ganhou escala com usinas de médio porte no Distrito Industrial e em municípios vizinhos. Com a expansão, integradoras locais relatam o mesmo gargalo: gente qualificada.",
      "“Hoje a limitação não é demanda, é equipe. Para cada engenheiro que contratamos, ficam duas vagas abertas”, resume o diretor de uma integradora ouvida pela reportagem. Os salários refletem a disputa: projetos fotovoltaicos pagam até R$ 10,5 mil para engenheiros e técnicos instaladores começam na faixa de R$ 2,8 mil — com treinamento pago pela empresa.",
      "Para quem vem de outras áreas da eletrotécnica, a transição é rápida: certificações NR-10 e NR-35, somadas a um curso de instalação fotovoltaica, abrem as portas do setor em poucos meses. Sindicatos e o Senai regional já ampliaram turmas para 2026.",
      "A expectativa do setor é que a região dobre a capacidade instalada até 2028, sustentando um ciclo longo de contratações — e consolidando Maringá como polo de energia renovável do interior do Paraná.",
    ] },
  { id: "pub1", empresa: "e3", chapeu: "Employer branding", titulo: "Dentro da Sabin: como a saúde diagnóstica forma novos líderes em Maringá", lead: "A empresa abriu as portas para mostrar seu programa de desenvolvimento interno e os planos de carreira que retêm talentos na região.", categoria: "Employer branding", status: "aprovada", data: "07 jun 2026", tempo: "5 min", img: "images/sabin.png", keywords: ["saúde", "enfermagem", "rh"] },
  { id: "pub2", empresa: "e6", chapeu: "Cultura", titulo: "Unimed Maringá amplia benefícios de saúde mental para colaboradores", lead: "Programa inclui sessões de terapia, licenças dedicadas e rodas de conversa sobre bem-estar no trabalho.", categoria: "Cultura", status: "aprovada", data: "05 jun 2026", tempo: "4 min", img: "images/unimed.jpeg", keywords: ["saúde", "enfermagem"] },
  { id: "pub3", empresa: null, chapeu: "Mercado de trabalho", titulo: "Norte do Paraná lidera abertura de vagas em tecnologia no 1º semestre", lead: "Levantamento da redação aponta crescimento de 18% nas contratações de TI na região metropolitana de Maringá.", categoria: "Reportagem", status: "aprovada", data: "08 jun 2026", tempo: "4 min", img: "images/mercado-ti.webp", keywords: ["dados", "desenvolvedor", "tecnologia"] },
  { id: "pub4", empresa: "e1", chapeu: "Carreira", titulo: "Programa Jovem Aprendiz do Grupo Amigão abre 60 vagas em 2026", lead: "Iniciativa busca formar jovens para o varejo regional, com trilha de efetivação ao fim do contrato.", categoria: "Employer branding", status: "pendente", data: "09 jun 2026", tempo: "3 min", keywords: ["vendedor", "logística", "aprendiz"] },
  { id: "pub5", empresa: "e2", chapeu: "Tecnologia", titulo: "Como a Apitec automatiza a indústria do Norte do Paraná", lead: "Bastidores dos projetos de automação elétrica e o perfil de profissional que a empresa busca.", categoria: "Employer branding", status: "pendente", data: "09 jun 2026", tempo: "6 min", keywords: ["dados", "desenvolvedor", "engenharia"] },
  { id: "pub6", empresa: "e2", chapeu: "Cultura", titulo: "Apitec é eleita uma das melhores empresas para trabalhar", lead: "Reconhecimento veio de pesquisa interna de clima organizacional realizada em 2026.", categoria: "Cultura", status: "reprovada", motivo: "Faltam dados que comprovem o prêmio citado. Reenvie incluindo a fonte e o nome da pesquisa.", data: "06 jun 2026", tempo: "2 min", keywords: ["dados", "engenharia"] },
];
const CATEGORIAS_PUB = ["Employer branding", "Cultura", "Carreira", "Vagas em destaque", "Reportagem"];

// Tribuna do Talento — conteúdo publicado por profissionais (creator economy)
function fmtN(n){ return n>=1000 ? (n/1000).toFixed(n>=10000?0:1).replace('.',',')+'k' : String(n); }
const TRIBUNA_AREAS = ["Design", "Tecnologia", "Engenharia", "Gestão", "Marketing", "Dados"];
const TRIBUNA = [
  { id:"tr1", autor:"Marina Lopes", cargo:"Product Designer", area:"Design", tipo:"Portfólio",
    titulo:"Redesenhei o app de uma cooperativa de Maringá — e a adesão digital subiu 3x",
    lead:"Um estudo de caso completo: da pesquisa com produtores rurais à entrega final, com as decisões de design que destravaram o uso do app entre quem nunca tinha usado banco digital.",
    data:"12 jun 2026", tempo:"7 min", leituras:18400, curtidas:1240, comentarios:86, viral:true, radar:true, disponivel:true,
    corpo:[
      "Quando a cooperativa me procurou, o problema parecia simples: “o app existe, mas ninguém usa”. Em duas semanas de pesquisa de campo, entrevistando produtores de soja e café do Norte do Paraná, ficou claro que o problema não era o app — era a distância entre a linguagem do produto e a realidade de quem ia usá-lo.",
      "A primeira decisão foi abandonar a metáfora bancária. Em vez de ‘extrato’, ‘saldo disponível’ e ‘transferência’, passamos a falar em ‘o que entrou’, ‘o que dá pra usar agora’ e ‘enviar dinheiro’. Pequeno no código, enorme no comportamento.",
      "O segundo movimento foi tornar a primeira tela útil sem login. O produtor abria o app, via a cotação do dia e o status da última entrega — antes mesmo de digitar a senha. A retomada de uso semanal saltou de 11% para 38% nos primeiros 30 dias.",
      "O aprendizado que levo: acessibilidade não é só contraste e tamanho de fonte. É respeitar o repertório de quem usa. O melhor design é o que some — e deixa a pessoa resolver o que veio resolver.",
    ] },
  { id:"tr2", autor:"Bruno Tavares", cargo:"Engenheiro de Software", area:"Tecnologia", tipo:"Análise técnica",
    titulo:"Por que migramos de microserviços de volta para um monolito — e economizamos 60% em infra",
    lead:"A história sem romantismo de uma decisão de arquitetura que contrariou o hype. O que medimos, o que deu errado e quando microserviços realmente valem a pena.",
    data:"11 jun 2026", tempo:"9 min", leituras:24100, curtidas:1890, comentarios:212, viral:true, radar:true, disponivel:true,
    corpo:[
      "Em 2024 tínhamos 14 microserviços para um produto com 9 mil usuários. Pareceu moderno na hora de desenhar. Na prática, gastamos mais tempo operando a malha de serviços do que entregando funcionalidade.",
      "A conta de infraestrutura passou de R$ 18 mil/mês. Cada deploy envolvia coordenar versões entre serviços, e um incidente simples virava caça ao fantasma entre cinco logs diferentes.",
      "Consolidamos em um monolito modular bem organizado. Mesmo time, mesma stack, módulos com fronteiras claras. A infra caiu para R$ 7 mil/mês e o tempo médio para subir uma feature caiu pela metade.",
      "Não é manifesto anti-microserviço. É um lembrete: arquitetura é trade-off, não tendência. Escolha pela dor que você tem, não pela palestra que você assistiu.",
    ] },
  { id:"tr3", autor:"Letícia Andrade", cargo:"Analista de Dados", area:"Dados", tipo:"Análise de mercado",
    titulo:"O mapa do salário em tech no interior do Paraná: o que os dados de 2026 revelam",
    lead:"Cruzei 1.200 vagas públicas de TI da região e descobri padrões que contrariam o senso comum sobre remoto, senioridade e faixas salariais.",
    data:"10 jun 2026", tempo:"6 min", leituras:15700, curtidas:980, comentarios:64, viral:true, radar:true, disponivel:false,
    corpo:[
      "Coletei dados de 1.200 vagas de tecnologia abertas no Norte do Paraná entre janeiro e maio de 2026. A primeira surpresa: a mediana salarial do interior já é 87% da capital — contra 71% em 2023.",
      "Vagas 100% remotas pagam, em média, 22% mais que presenciais para a mesma senioridade. Mas representam apenas 1 em cada 5 anúncios — a maioria das empresas locais ainda prefere híbrido.",
      "O maior gargalo não é júnior nem sênior: é o pleno. Empresas disputam quem tem de 2 a 4 anos de experiência, e as faixas para esse perfil cresceram 19% em um ano.",
      "Os dados completos e o notebook estão no meu repositório. Se você recruta na região, vale calibrar suas faixas — o mercado se moveu mais rápido do que os planos de cargos.",
    ] },
  { id:"tr4", autor:"Diego Moraes", cargo:"Gerente de Operações", area:"Gestão", tipo:"Opinião",
    titulo:"Demiti a reunião diária e a produtividade do time subiu. Eis o que coloquei no lugar",
    lead:"Reunião não é trabalho — é sobre o trabalho. Como reorganizei a rotina de um time de 12 pessoas em torno de assincronia e foco.",
    data:"09 jun 2026", tempo:"5 min", leituras:9800, curtidas:720, comentarios:48, viral:false, radar:false, disponivel:true,
    corpo:[
      "A daily de 15 minutos virava 40. Multiplicado por 12 pessoas e 5 dias, eram 16 horas semanais só em status. Decidi testar um mês sem ela.",
      "No lugar, criamos um ritual assíncrono: cada pessoa escreve, até as 10h, três linhas — o que fez, o que vai fazer, onde travou. Quem precisa de ajuda marca um bloco curto e específico.",
      "O ganho não foi só tempo. Escrever obriga a pensar; as travas viraram visíveis cedo. E quem trabalha melhor de manhã deixou de ter o foco quebrado às 9h.",
      "Reunião boa existe — para decidir, alinhar rumo, resolver conflito. Ruim é a que poderia ser um texto. Comece cortando essa.",
    ] },
  { id:"tr5", autor:"Patrícia Lima", cargo:"Redatora & Estrategista", area:"Marketing", tipo:"Tutorial",
    titulo:"Escrevi 200 anúncios de vaga. Os 7 erros que afastam bons candidatos",
    lead:"A descrição da vaga é a primeira impressão da sua empresa. Um guia prático de copy para RH que quer atrair — e não espantar — talento.",
    data:"08 jun 2026", tempo:"6 min", leituras:13200, curtidas:1100, comentarios:73, viral:true, radar:false, disponivel:true,
    corpo:[
      "Erro 1: a lista interminável de requisitos. Ninguém preenche 100%. Separe ‘essencial’ de ‘desejável’ e veja sua taxa de candidatura subir.",
      "Erro 2: falar só do que a empresa quer. Inverta. Comece pelo que o candidato ganha — problema interessante, autonomia, aprendizado, faixa salarial real.",
      "Erro 3: jargão vazio. ‘Ambiente dinâmico’ e ‘vista a camisa’ não dizem nada. Mostre um dia real do trabalho, com exemplos concretos.",
      "O resto dos erros — e os modelos prontos que uso — estão no fim do texto. Copy de vaga é marketing: você está vendendo um lugar para a pessoa passar um terço da vida.",
    ] },
  { id:"tr6", autor:"Rafael Costa", cargo:"Engenheiro Fotovoltaico", area:"Engenharia", tipo:"Análise técnica",
    titulo:"Dimensionei 40 usinas solares no Paraná: o erro de projeto que vejo em quase todas",
    lead:"Sombreamento parcial é subestimado e custa caro. Um guia visual de como o traçado dos módulos define o retorno do investimento.",
    data:"07 jun 2026", tempo:"8 min", leituras:8100, curtidas:540, comentarios:39, viral:false, radar:true, disponivel:true,
    corpo:[
      "Sombra de uma única chaminé ou árvore pode derrubar a geração de uma fileira inteira de módulos, dependendo de como o sistema foi ligado. Vejo esse erro em 7 de cada 10 projetos que audito.",
      "A causa é quase sempre a mesma: string mal planejada. Agrupar módulos que recebem sombra em horários diferentes na mesma série penaliza todo o conjunto.",
      "A correção custa pouco na fase de projeto e quase nada em otimizadores quando pensada cedo. Depois de instalado, vira prejuízo recorrente por 25 anos.",
      "Anexei os diagramas de traçado que uso como referência. Engenharia solar é detalhe: o sol é de graça, mas o projeto ruim cobra caro todo mês.",
    ] },
];
function tribunaById(id){ return TRIBUNA.find(t=>t.id===id); }

Object.assign(window, {
  TIPOS, MODALIDADES, AREAS, CIDADES, EMPRESAS, empById, MARCAS, brandLogo, VAGAS, vagaById, ARTIGOS, PACOTES, PUBLICACOES, CATEGORIAS_PUB, TRIBUNA, TRIBUNA_AREAS, tribunaById, fmtN,
});
