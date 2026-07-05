-- Fase 1 (F1-E) — LGPD: consentimentos granulares (RNF-07).
-- Histórico append-only: cada mudança gera uma linha nova com timestamp/versão/IP.
-- O estado atual de um consentimento é a linha mais recente por (user_id, tipo).
create table if not exists consentimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid references organizacoes(id),
  tipo text not null check (tipo in ('candidaturas', 'whatsapp', 'compartilhamento')),
  aceito boolean not null,
  versao text,
  ip text,
  criado_em timestamptz default now()
);

alter table consentimentos enable row level security;

drop policy if exists "consent próprio: ler" on consentimentos;
create policy "consent próprio: ler" on consentimentos for select using (user_id = auth.uid());

drop policy if exists "consent próprio: registrar" on consentimentos;
create policy "consent próprio: registrar" on consentimentos for insert with check (user_id = auth.uid());

create index if not exists consentimentos_user_idx on consentimentos(user_id, tipo, criado_em desc);
