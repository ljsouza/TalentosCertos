-- v1.5 — Extração de currículo: campo de skills no perfil do candidato.
-- area, cidade e resumo já existem em candidatos (0001).
alter table candidatos add column if not exists skills text[] default '{}';
