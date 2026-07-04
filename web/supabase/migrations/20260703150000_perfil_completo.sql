-- Fase 1 (F1-D) — perfil completo do candidato + dados cadastrais da empresa.
-- Candidato: CPF, formação/experiência estruturadas (JSONB) e pontos fortes (IA).
-- Empresa: CNPJ e razão social (RF-42). CPF/CNPJ são dado pessoal (não "sensível"
-- no sentido da LGPD — este fica para CID/PCD, tratado à parte); armazenados em texto.

alter table candidatos add column if not exists cpf text;
alter table candidatos add column if not exists formacoes jsonb not null default '[]'::jsonb;
alter table candidatos add column if not exists experiencias jsonb not null default '[]'::jsonb;
alter table candidatos add column if not exists pontos_fortes text[] default '{}';

alter table empresas add column if not exists cnpj text;
alter table empresas add column if not exists razao_social text;
