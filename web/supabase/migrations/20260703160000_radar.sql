-- Fase 1 (F1-C) — Radar de Vagas por WhatsApp (item 1.14).
-- radar_whatsapp e radar_consentido_em já existem (0001). Adiciona a pretensão
-- salarial do radar e um índice para o matching ao publicar vaga.
alter table candidatos add column if not exists radar_salario_min int;

-- Matching rápido: candidatos com radar ativo por tenant + área.
create index if not exists candidatos_radar_idx on candidatos(org_id, area) where radar_whatsapp;
