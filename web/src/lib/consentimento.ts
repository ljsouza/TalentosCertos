// LGPD — consentimentos granulares (RNF-07).
export const POLICY_VERSION = "2026-07-04";

export const TIPOS_CONSENTIMENTO = ["candidaturas", "whatsapp", "compartilhamento"] as const;
export type TipoConsentimento = (typeof TIPOS_CONSENTIMENTO)[number];

export const LABEL_CONSENTIMENTO: Record<TipoConsentimento, string> = {
  candidaturas: "Uso dos meus dados para candidaturas a vagas",
  whatsapp: "Receber alertas de vagas por WhatsApp (Radar)",
  compartilhamento: "Compartilhar meu perfil com empresas parceiras",
};
