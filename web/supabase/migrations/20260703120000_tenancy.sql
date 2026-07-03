-- Fase 0 — Fundação multi-tenant.
-- Introduz o conceito de ORGANIZAÇÃO (tenant) e escopa os dados por org_id.
-- MaringáPost é o primeiro tenant (parceiro, embutido em /empregos); prefeituras
-- entram como novos tenants no SaaS, cada uma em <slug>.talentoscertos.com.br.
--
-- Estratégia: banco compartilhado + org_id + RLS por tenant (a RLS entra na 00011).
-- Esta migration cria a tabela, adiciona org_id, faz seed + backfill do MaringáPost
-- e passa a preencher org_id automaticamente em novos registros.

-- ── Organizações (tenants) ──────────────────────────────────────────────────
create table if not exists organizacoes (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,                    -- subdomínio SaaS: <slug>.talentoscertos.com.br
  nome      text not null,
  tipo      text not null default 'prefeitura' check (tipo in ('parceiro','prefeitura')),
  base_path text,                                    -- ex.: '/empregos' (parceiro embutido) ou null (raiz)
  dominio   text,                                    -- host próprio, se houver (ex.: 'maringapost.com.br')
  branding  jsonb not null default '{}'::jsonb,      -- { accent, display, logo_url, ... }
  status    text not null default 'ativo' check (status in ('ativo','trial','suspenso')),
  criado_em timestamptz default now()
);

alter table organizacoes enable row level security;

-- Leitura pública: o app precisa resolver branding/slug antes do login.
drop policy if exists "organizacoes públicas para leitura" on organizacoes;
create policy "organizacoes públicas para leitura" on organizacoes for select using (true);

-- Seed do primeiro tenant: MaringáPost (parceiro, servido sob /empregos).
insert into organizacoes (slug, nome, tipo, base_path, dominio, status)
values ('maringapost', 'MaringáPost Empregos', 'parceiro', '/empregos', 'maringapost.com.br', 'ativo')
on conflict (slug) do nothing;

-- ── Helper: org corrente para defaults/triggers ─────────────────────────────
-- Resolve, nesta ordem: (1) GUC 'app.current_org' setada pelo app por request,
-- (2) fallback para o tenant MaringáPost. Usado quando não há parente do qual
-- derivar o org_id (ex.: publicação da redação, post de tribuna sem autor).
create or replace function public.default_org()
returns uuid language sql stable set search_path = public as $$
  select coalesce(
    nullif(current_setting('app.current_org', true), '')::uuid,
    (select id from organizacoes where slug = 'maringapost')
  );
$$;

-- ── org_id nas tabelas de topo ──────────────────────────────────────────────
-- Tabelas de junção (candidaturas, vagas_salvas) herdam o tenant via FKs.
alter table perfis      add column if not exists org_id uuid references organizacoes(id);
alter table empresas    add column if not exists org_id uuid references organizacoes(id);
alter table candidatos  add column if not exists org_id uuid references organizacoes(id);
alter table vagas       add column if not exists org_id uuid references organizacoes(id);
alter table publicacoes add column if not exists org_id uuid references organizacoes(id);
alter table tribuna     add column if not exists org_id uuid references organizacoes(id);
alter table pacotes     add column if not exists org_id uuid references organizacoes(id);

-- Backfill: tudo que já existe pertence ao MaringáPost.
do $$
declare v_org uuid := (select id from organizacoes where slug = 'maringapost');
begin
  update perfis      set org_id = v_org where org_id is null;
  update empresas    set org_id = v_org where org_id is null;
  update candidatos  set org_id = v_org where org_id is null;
  update vagas       set org_id = v_org where org_id is null;
  update publicacoes set org_id = v_org where org_id is null;
  update tribuna     set org_id = v_org where org_id is null;
  update pacotes     set org_id = v_org where org_id is null;
end $$;

-- Agora torna obrigatório (todas as linhas já têm org_id).
alter table perfis      alter column org_id set not null;
alter table empresas    alter column org_id set not null;
alter table candidatos  alter column org_id set not null;
alter table vagas       alter column org_id set not null;
alter table publicacoes alter column org_id set not null;
alter table tribuna     alter column org_id set not null;
alter table pacotes     alter column org_id set not null;

-- Índices para filtros/joins por tenant.
create index if not exists empresas_org_idx    on empresas(org_id);
create index if not exists candidatos_org_idx  on candidatos(org_id);
create index if not exists vagas_org_idx        on vagas(org_id);
create index if not exists publicacoes_org_idx on publicacoes(org_id);
create index if not exists tribuna_org_idx     on tribuna(org_id);
create index if not exists pacotes_org_idx     on pacotes(org_id);

-- ── Preenchimento automático de org_id em novos registros ───────────────────

-- Signup: perfil + candidato/empresa herdam o tenant do metadado do cadastro
-- (options.data.org_id), com fallback para MaringáPost em contexto de servidor.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_papel text := coalesce(new.raw_user_meta_data->>'papel', 'candidato');
  v_nome  text := coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_org   uuid := nullif(new.raw_user_meta_data->>'org_id', '')::uuid;
begin
  if v_org is null then
    select id into v_org from organizacoes where slug = 'maringapost';
  end if;
  insert into perfis (id, papel, nome, org_id) values (new.id, v_papel, v_nome, v_org);
  if v_papel = 'empresa' then
    insert into empresas (dono_id, nome, org_id) values (new.id, v_nome, v_org);
  else
    insert into candidatos (id, org_id) values (new.id, v_org);
  end if;
  return new;
end;
$$;

-- Vagas herdam o org_id da empresa dona (o app não precisa passar org_id).
create or replace function public.vagas_set_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.org_id is null then
    select org_id into new.org_id from empresas where id = new.empresa_id;
  end if;
  return new;
end;
$$;
drop trigger if exists vagas_set_org_trg on vagas;
create trigger vagas_set_org_trg before insert on vagas
  for each row execute function public.vagas_set_org();

-- Publicações: derivam da empresa quando houver; senão, org corrente (redação).
create or replace function public.publicacoes_set_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.org_id is null then
    new.org_id := coalesce(
      (select org_id from empresas where id = new.empresa_id),
      public.default_org()
    );
  end if;
  return new;
end;
$$;
drop trigger if exists publicacoes_set_org_trg on publicacoes;
create trigger publicacoes_set_org_trg before insert on publicacoes
  for each row execute function public.publicacoes_set_org();

-- Tribuna: deriva do perfil do autor quando houver; senão, org corrente.
create or replace function public.tribuna_set_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.org_id is null then
    new.org_id := coalesce(
      (select org_id from perfis where id = new.autor_id),
      public.default_org()
    );
  end if;
  return new;
end;
$$;
drop trigger if exists tribuna_set_org_trg on tribuna;
create trigger tribuna_set_org_trg before insert on tribuna
  for each row execute function public.tribuna_set_org();
