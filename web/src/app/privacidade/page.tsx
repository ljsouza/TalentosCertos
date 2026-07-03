import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o MaringáPost Empregos coleta, usa e protege seus dados pessoais (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <div className="screen" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px", lineHeight: 1.7 }}>
      <span className="chapeu">Transparência</span>
      <h1 style={{ fontSize: 30, margin: "6px 0 6px" }}>Política de Privacidade</h1>
      <p style={{ color: "var(--ink-60)", marginBottom: 24 }}>
        Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>1. Quem trata seus dados</h2>
      <p>
        A plataforma de empregos é operada em parceria com o MaringáPost. O controlador dos dados é a organização
        responsável pelo portal em que você se cadastrou. Dúvidas e solicitações sobre seus dados podem ser
        enviadas pelo canal de contato indicado ao final desta página.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>2. Dados que coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, telefone e senha (armazenada de forma cifrada).</li>
        <li><strong>Perfil do candidato:</strong> área, cidade, resumo, competências e currículo (PDF).</li>
        <li><strong>Perfil da empresa:</strong> dados institucionais e da pessoa responsável.</li>
        <li><strong>Uso:</strong> vagas salvas, candidaturas e interações na plataforma.</li>
      </ul>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>3. Para que usamos</h2>
      <p>
        Para conectar candidatos e empresas: exibir vagas, permitir candidaturas, recomendar vagas compatíveis
        (via IA) e viabilizar o contato entre as partes. Não vendemos seus dados.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>4. Compartilhamento</h2>
      <p>
        Ao se candidatar a uma vaga, seu perfil e currículo são compartilhados com a empresa responsável por
        aquela vaga. Utilizamos provedores de infraestrutura (banco de dados, armazenamento, envio de e-mail e IA)
        estritamente para operar o serviço.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>5. Radar de Vagas por WhatsApp (consentimento)</h2>
      <p>
        O Radar de Vagas é opcional. Ao ativá-lo, você <strong>consente expressamente</strong> em receber, no número
        informado, mensagens sobre vagas compatíveis com seu perfil, nos termos da LGPD. Esse consentimento é
        específico e pode ser <strong>revogado a qualquer momento</strong> no seu painel, sem prejuízo do uso das
        demais funções da plataforma.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>6. Dados sensíveis (acessibilidade / PCD)</h2>
      <p>
        Informações sobre deficiência e adaptações necessárias são dados sensíveis, fornecidos de forma voluntária
        e usados apenas para viabilizar vagas afirmativas e acessíveis. Só são exibidos a empresas com recursos de
        inclusão, mediante seu consentimento na candidatura.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>7. Armazenamento e segurança</h2>
      <p>
        Os dados são armazenados em provedor com controle de acesso por linha (RLS) e criptografia em trânsito.
        Currículos ficam em armazenamento privado, acessível à empresa apenas quando você se candidata.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>8. Seus direitos</h2>
      <p>
        Você pode acessar, corrigir, portar e <strong>excluir</strong> seus dados, além de revogar consentimentos.
        A exclusão da conta está disponível diretamente no seu painel
        (<Link href="/painel-candidato" style={{ color: "var(--accent)" }}>candidato</Link> ou{" "}
        <Link href="/painel-empresa" style={{ color: "var(--accent)" }}>empresa</Link>) e remove de forma permanente
        seu perfil, currículo, candidaturas, vagas e publicações associadas.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>9. Cookies e métricas</h2>
      <p>
        Usamos cookies essenciais para autenticação e métricas de audiência para entender o uso da plataforma e
        melhorá-la. Não usamos os dados para publicidade de terceiros.
      </p>

      <h2 style={{ fontSize: 19, marginTop: 24 }}>10. Contato</h2>
      <p>
        Para exercer seus direitos ou tirar dúvidas sobre privacidade, fale com a equipe do MaringáPost pelo canal
        de atendimento do portal.
      </p>

      <p style={{ color: "var(--ink-60)", fontSize: 13, marginTop: 32 }}>
        Esta política pode ser atualizada. Consulte esta página periodicamente.
      </p>
    </div>
  );
}
