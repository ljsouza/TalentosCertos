// feature-ia-vaga.jsx — IA que cria vagas a partir de uma frase
const { useState: useStateIA } = React;

// ---- Base de conhecimento de cargos (gerador determinístico) ----
const IA_ROLES = [
  { match: ["vendedor", "vendas", "comercial", "representante"], area: "Comercial / Vendas", titulo: "Vendedor(a) Interno(a)",
    base: 1900, faixa: [1900, 2800], comissao: true,
    desc: "Atuar na venda ativa e receptiva de produtos/serviços, construindo relacionamento com a carteira de clientes e batendo metas mensais. O profissional será responsável por todo o ciclo comercial — da prospecção ao fechamento — com apoio do time de marketing e pós-venda.",
    resp: ["Prospectar e qualificar novos clientes por telefone, WhatsApp e CRM", "Apresentar produtos, elaborar propostas e negociar condições", "Acompanhar a carteira ativa e garantir recompra", "Registrar interações e atualizar o funil no CRM", "Bater metas mensais individuais e de equipe"],
    req: ["Ensino médio completo (superior em andamento é diferencial)", "Experiência prévia com vendas ou atendimento ao cliente", "Boa comunicação, escuta ativa e orientação a metas", "Familiaridade com CRM e ferramentas digitais"],
    desej: ["Vivência no segmento da empresa", "Curso técnico ou superior em Administração/Vendas"],
    benef: ["Salário fixo + comissão sem teto", "Vale-refeição e vale-transporte", "Plano de saúde após 90 dias", "Comissões e premiações por meta"],
    triagem: ["Conte uma negociação difícil que você fechou. Qual foi sua estratégia?", "Como você se organiza para bater metas quando o mês está fraco?", "Qual sua pretensão de remuneração fixa + variável?", "Você tem experiência com qual CRM ou ferramenta de vendas?"] },
  { match: ["desenvolvedor", "programador", "dev", "full-stack", "fullstack", "back-end", "front-end", "software", "engenheiro de software"], area: "Tecnologia / TI", titulo: "Desenvolvedor(a) de Software",
    base: 4500, faixa: [4500, 8500], comissao: false,
    desc: "Desenvolver, manter e evoluir aplicações web, escrevendo código limpo, testável e bem documentado. Trabalhará em squad ágil, participando de todo o ciclo — da concepção ao deploy — em colaboração com produto e design.",
    resp: ["Implementar features e corrigir bugs em aplicações web", "Escrever testes automatizados e revisar código dos pares", "Participar de cerimônias ágeis (planning, review, retro)", "Colaborar com produto e design na definição técnica", "Monitorar e melhorar performance das aplicações"],
    req: ["Experiência com pelo menos uma linguagem moderna (JS/TS, Python, Java, etc.)", "Conhecimento de versionamento Git e fluxo de PRs", "Noções de banco de dados relacional e APIs REST", "Boas práticas de código e testes"],
    desej: ["Experiência com cloud (AWS/GCP) e CI/CD", "Vivência com metodologias ágeis"],
    benef: ["Modelo de trabalho flexível", "Plano de saúde e odontológico", "Auxílio home office", "Budget de cursos e certificações"],
    triagem: ["Descreva um projeto técnico do qual você se orgulha e seu papel nele.", "Como você garante a qualidade do código que entrega?", "Qual sua experiência com trabalho em equipe ágil?", "Quais tecnologias você domina e quais quer aprender?"] },
  { match: ["analista de dados", "dados", "data", "bi", "business intelligence"], area: "Tecnologia / TI", titulo: "Analista de Dados",
    base: 3800, faixa: [3800, 6500], comissao: false,
    desc: "Coletar, tratar e analisar dados para gerar insights que apoiam decisões de negócio. Construir dashboards, automatizar relatórios e traduzir números em recomendações acionáveis para as áreas.",
    resp: ["Extrair e tratar dados de múltiplas fontes (SQL, planilhas, APIs)", "Construir e manter dashboards e relatórios", "Analisar indicadores e identificar tendências", "Apresentar insights para as áreas de negócio", "Automatizar rotinas de coleta e reporte"],
    req: ["Domínio de SQL e Excel avançado", "Experiência com ferramenta de BI (Power BI, Looker, Tableau)", "Pensamento analítico e atenção a detalhes", "Boa comunicação para apresentar dados"],
    desej: ["Conhecimento em Python ou R", "Noções de estatística e modelagem"],
    benef: ["Modelo híbrido de trabalho", "Plano de saúde", "Auxílio educação", "Participação nos resultados"],
    triagem: ["Conte uma análise sua que mudou uma decisão da empresa.", "Como você valida a qualidade de um conjunto de dados?", "Qual ferramenta de BI você domina melhor?", "Como você explica um dado complexo para quem não é técnico?"] },
  { match: ["enfermeiro", "enfermagem", "técnico de enfermagem", "saúde", "cuidador"], area: "Saúde", titulo: "Técnico(a) de Enfermagem",
    base: 2400, faixa: [2400, 3400], comissao: false,
    desc: "Prestar assistência de enfermagem aos pacientes sob supervisão do enfermeiro, garantindo cuidado seguro, humanizado e dentro dos protocolos da instituição.",
    resp: ["Realizar procedimentos de enfermagem conforme prescrição", "Aferir sinais vitais e administrar medicações", "Registrar evolução e intercorrências no prontuário", "Zelar pela segurança e conforto do paciente", "Seguir protocolos de biossegurança e controle de infecção"],
    req: ["Curso técnico em Enfermagem completo", "COREN ativo", "Disponibilidade para escala 12x36", "Postura ética e empática"],
    desej: ["Experiência hospitalar ou em pronto atendimento", "Cursos de atualização (suporte básico de vida, etc.)"],
    benef: ["Plano de saúde e odontológico", "Vale-alimentação", "Adicional de insalubridade", "Plano de carreira"],
    triagem: ["Como você lida com uma intercorrência grave durante o plantão?", "Descreva sua rotina de segurança ao administrar medicações.", "Você tem disponibilidade para escala 12x36?", "Conte uma situação em que seu cuidado fez diferença para um paciente."] },
  { match: ["marketing", "social media", "redator", "conteúdo", "growth"], area: "Marketing", titulo: "Analista de Marketing",
    base: 2800, faixa: [2800, 5000], comissao: false,
    desc: "Planejar e executar ações de marketing digital e offline para fortalecer a marca, gerar demanda e nutrir a base. Atuar com conteúdo, mídia paga, redes sociais e análise de resultados.",
    resp: ["Planejar e produzir conteúdo para redes sociais e blog", "Gerir campanhas de mídia paga e acompanhar métricas", "Apoiar o time comercial com materiais e geração de leads", "Analisar resultados e propor melhorias", "Cuidar da consistência da marca nos canais"],
    req: ["Superior em andamento/completo em Marketing, Publicidade ou áreas afins", "Experiência com redes sociais e ferramentas de criação", "Boa escrita e senso estético", "Familiaridade com métricas e relatórios"],
    desej: ["Vivência com tráfego pago (Meta/Google Ads)", "Conhecimento de ferramentas de automação"],
    benef: ["Modelo híbrido", "Vale-refeição", "Plano de saúde", "Budget de cursos"],
    triagem: ["Mostre uma campanha ou conteúdo seu que deu certo. Por que funcionou?", "Como você mede o sucesso de uma ação de marketing?", "Quais ferramentas de criação e análise você usa?", "Como você equilibra criatividade e prazos?"] },
  { match: ["logística", "estoque", "almoxarife", "expedição", "motorista", "auxiliar de logística"], area: "Logística", titulo: "Assistente de Logística",
    base: 1800, faixa: [1800, 2600], comissao: false,
    desc: "Apoiar as operações de recebimento, armazenagem, separação e expedição de mercadorias, garantindo organização do estoque e cumprimento dos prazos de entrega.",
    resp: ["Conferir e organizar o recebimento de mercadorias", "Separar e embalar pedidos para expedição", "Manter o controle e a acuracidade do estoque", "Operar sistema de gestão (WMS/ERP)", "Apoiar inventários periódicos"],
    req: ["Ensino médio completo", "Experiência em rotinas de estoque ou logística", "Organização e atenção a detalhes", "Noções de sistemas de gestão"],
    desej: ["Curso técnico em Logística", "Operação de empilhadeira (com certificação)"],
    benef: ["Vale-transporte e refeição no local", "Plano de saúde", "Adicional por produtividade", "Plano de carreira"],
    triagem: ["Como você garante a acuracidade do estoque no dia a dia?", "Descreva como você prioriza pedidos em um dia de alto volume.", "Você tem experiência com qual sistema (ERP/WMS)?", "Tem disponibilidade para trabalhar em escala?"] },
];

const IA_GENERIC = { area: "Administrativo", titulo: "Profissional",
  base: 2000, faixa: [2000, 3200], comissao: false,
  desc: "Atuar nas rotinas da área, apoiando a equipe na execução das atividades com organização, qualidade e cumprimento de prazos.",
  resp: ["Executar as rotinas e processos da área", "Organizar documentos, registros e informações", "Apoiar a equipe e demais setores", "Cumprir prazos e padrões de qualidade", "Propor melhorias nos processos"],
  req: ["Ensino médio completo", "Experiência na função ou área correlata", "Organização e boa comunicação", "Familiaridade com ferramentas digitais"],
  desej: ["Curso técnico ou superior na área", "Vivência no segmento da empresa"],
  benef: ["Vale-refeição e vale-transporte", "Plano de saúde", "Plano de carreira", "Ambiente colaborativo"],
  triagem: ["Conte uma entrega da qual você se orgulha nesta função.", "Como você se organiza para cumprir vários prazos ao mesmo tempo?", "Qual sua pretensão salarial?", "Por que você se interessou por esta vaga?"] };

const SENIORIDADES = [
  { match: ["estágio", "estagiário", "estagiar"], label: "Estágio", fator: 0.45, prefixo: "Estágio em " },
  { match: ["aprendiz", "jovem aprendiz"], label: "Jovem Aprendiz", fator: 0.4, prefixo: "Jovem Aprendiz — " },
  { match: ["júnior", "junior", "jr", "iniciante", "trainee"], label: "Júnior", fator: 0.75, sufixo: " Júnior" },
  { match: ["pleno", "pl"], label: "Pleno", fator: 1.0, sufixo: " Pleno" },
  { match: ["sênior", "senior", "sr", "especialista"], label: "Sênior", fator: 1.45, sufixo: " Sênior" },
  { match: ["coordenador", "supervisor", "líder", "lider"], label: "Coordenação", fator: 1.7, prefixo: "Coordenador(a) de " },
  { match: ["gerente", "head", "gestor"], label: "Gerência", fator: 2.2, prefixo: "Gerente de " },
];

function detectModalidade(p) {
  if (/remoto|home\s*office|à dist|home/i.test(p)) return "remoto";
  if (/híbrido|hibrido/i.test(p)) return "hibrido";
  return "presencial";
}
function brl(n) { return "R$ " + n.toLocaleString("pt-BR"); }

function gerarVagaIA(prompt) {
  const p = (prompt || "").toLowerCase();
  const role = IA_ROLES.find((r) => r.match.some((m) => p.includes(m))) || IA_GENERIC;
  const sen = SENIORIDADES.find((s) => s.match.some((m) => p.includes(m)));
  const modalidade = detectModalidade(p);

  // título com senioridade
  let titulo = role.titulo;
  if (sen) {
    if (sen.prefixo) titulo = sen.prefixo + role.titulo.replace(/^(Vendedor\(a\) |Analista de |Técnico\(a\) de |Desenvolvedor\(a\) |Assistente de )/, "").replace("Interno(a)", "Vendas Interno");
    else if (sen.sufixo) titulo = role.titulo + sen.sufixo;
  }
  // "vendedor interno" mantém
  if (p.includes("interno")) titulo = titulo.replace("Vendedor(a)", "Vendedor(a) Interno(a)").replace("Interno(a) Interno(a)", "Interno(a)");
  if (p.includes("externo")) titulo = role.titulo.replace("Interno(a)", "Externo(a)");

  // salário ajustado por senioridade
  const fator = sen ? sen.fator : 1;
  const sMin = Math.round((role.faixa[0] * fator) / 50) * 50;
  const sMax = Math.round((role.faixa[1] * fator) / 50) * 50;
  const salario = `${brl(sMin)} – ${brl(sMax)}${role.comissao ? " + comissão" : ""}`;

  const modLabel = { presencial: "presencial", hibrido: "híbrido", remoto: "remoto" }[modalidade];
  const senLabel = sen ? `${sen.label} · ` : "";

  // anúncio otimizado
  const anuncio = `🚀 Vaga: ${titulo} — ${modLabel} (${(window.EMPRESAS && window.EMPRESAS[0]?.cidade) || "Maringá"})\n\n` +
    `${role.desc}\n\n` +
    `✅ O que você vai fazer:\n${role.resp.slice(0, 4).map((r) => "• " + r).join("\n")}\n\n` +
    `🎯 O que buscamos:\n${role.req.slice(0, 3).map((r) => "• " + r).join("\n")}\n\n` +
    `💚 Oferecemos:\n${role.benef.slice(0, 3).map((b) => "• " + b).join("\n")}\n\n` +
    `📍 Faixa: ${salario} · Modelo ${modLabel}\n` +
    `Candidate-se pelo MaringáPost Empregos — sua resposta garantida.`;

  return {
    titulo, area: role.area, modalidade, salario, senLabel,
    descricao: role.desc,
    responsabilidades: role.resp,
    requisitos: role.req,
    desejaveis: role.desej,
    beneficios: role.benef,
    triagem: role.triagem,
    anuncio,
  };
}

// ---- Componente: caixa de prompt + geração ----
function IAVagaBox({ onGerar }) {
  const [prompt, setPrompt] = useStateIA("");
  const [loading, setLoading] = useStateIA(false);
  const exemplos = ["Preciso contratar um vendedor interno", "Desenvolvedor full-stack pleno remoto", "Técnico de enfermagem para plantão", "Analista de marketing júnior"];

  const gerar = () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setTimeout(() => { onGerar(gerarVagaIA(prompt), prompt); setLoading(false); }, 1300);
  };

  return (
    <div className="iav-box">
      <div className="iav-head">
        <span className="iav-badge"><Icon name="bolt" size={14} /> IA do MaringáPost</span>
        <h3>Descreva a vaga em uma frase. A IA cria o resto.</h3>
        <p>Título, descrição, requisitos, faixa salarial, perguntas de triagem e um anúncio otimizado — prontos em segundos para você revisar.</p>
      </div>
      <div className="iav-input-row">
        <textarea rows="2" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='Ex: "Preciso contratar um vendedor interno"'
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) gerar(); }} />
        <button className="iav-gen" onClick={gerar} disabled={!prompt.trim() || loading}>
          {loading ? <span className="iav-dots"><span /><span /><span /></span> : <><Icon name="bolt" size={17} stroke={2} /> Gerar vaga</>}
        </button>
      </div>
      <div className="iav-examples">
        <span>Tente:</span>
        {exemplos.map((ex) => <button key={ex} onClick={() => setPrompt(ex)}>{ex}</button>)}
      </div>
    </div>
  );
}

Object.assign(window, { gerarVagaIA, IAVagaBox });
