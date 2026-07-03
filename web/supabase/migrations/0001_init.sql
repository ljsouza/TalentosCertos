-- MaringáPost Empregos — schema inicial (v0)
-- Ordem respeita as dependências de chave estrangeira.
-- Rodar no SQL Editor do Supabase ou via `supabase db push`.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists vector;     -- pgvector (match semântico, v2.0)

-- ── Perfis (1:1 com auth.users) ─────────────────────────────────────────────
create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  papel text not null check (papel in ('candidato','empresa','admin')),
  nome text not null,
  telefone text,
  criado_em timestamptz default now()
);

-- ── Pacotes comerciais ──────────────────────────────────────────────────────
create table pacotes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  preco numeric,
  periodo text,
  vagas_limite int,
  recursos text[] default '{}',
  destaque boolean default false
);

-- ── Empresas ────────────────────────────────────────────────────────────────
create table empresas (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid references perfis(id),
  nome text not null,
  setor text,
  sobre text,
  sobre_longo text,
  fundada int,
  funcionarios text,
  site text,
  endereco text,
  verificada boolean default false,
  responde boolean default false,
  tempo_resposta text,
  destaques text[] default '{}',
  video_youtube text,
  logo_url text,
  pacote_id uuid references pacotes(id),
  criado_em timestamptz default now()
);

-- ── Candidatos (1:1 com perfil candidato) ───────────────────────────────────
create table candidatos (
  id uuid primary key references perfis(id) on delete cascade,
  area text,
  cidade text,
  resumo text,
  curriculo_url text,
  radar_whatsapp boolean default false,
  radar_consentido_em timestamptz,
  embedding vector(384),
  criado_em timestamptz default now()
);

-- ── Vagas ───────────────────────────────────────────────────────────────────
create table vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  titulo text not null,
  area text,
  cidade text,
  modalidade text check (modalidade in ('presencial','hibrido','remoto')),
  tipos text[] default '{}',
  salario_min int,
  salario_max int,
  experiencia text,
  descricao text,
  requisitos text[] default '{}',
  beneficios text[] default '{}',
  filtro_pergunta text,
  filtro_formato text check (filtro_formato in ('audio','video')),
  destaque boolean default false,
  status text default 'aberta' check (status in ('aberta','encerrada','rascunho')),
  prazo date,
  embedding vector(384),
  criado_em timestamptz default now()
);

-- ── Candidaturas ────────────────────────────────────────────────────────────
create table candidaturas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references vagas(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  status text default 'enviada' check (status in ('enviada','triagem','selecionada','recusada')),
  resposta_ativa_url text,
  criado_em timestamptz default now(),
  unique (vaga_id, candidato_id)
);

-- ── Vagas salvas (era localStorage mp_saved) ────────────────────────────────
create table vagas_salvas (
  candidato_id uuid references candidatos(id) on delete cascade,
  vaga_id uuid references vagas(id) on delete cascade,
  criado_em timestamptz default now(),
  primary key (candidato_id, vaga_id)
);

-- ── Publicações de Carreira & RH (era mp_pubs) ──────────────────────────────
create table publicacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id),
  chapeu text,
  titulo text not null,
  lead text,
  categoria text,
  corpo text[] default '{}',
  img_url text,
  keywords text[] default '{}',
  status text default 'pendente' check (status in ('pendente','aprovada','reprovada')),
  motivo text,
  publicado_em date,
  criado_em timestamptz default now()
);

-- ── Tribuna do Talento ──────────────────────────────────────────────────────
create table tribuna (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references perfis(id),
  autor_nome text,
  cargo text,
  area text,
  tipo text,
  titulo text not null,
  lead text,
  corpo text[] default '{}',
  leituras int default 0,
  curtidas int default 0,
  comentarios int default 0,
  viral boolean default false,
  radar boolean default false,
  disponivel boolean default true,
  publicado_em date,
  criado_em timestamptz default now()
);

-- ── RLS (Row Level Security) ────────────────────────────────────────────────
-- Habilita em todas; políticas detalhadas entram na v1.0 junto com a auth real.
-- Por ora: leitura pública do que é público; escrita exige policy explícita.
alter table perfis        enable row level security;
alter table empresas      enable row level security;
alter table candidatos    enable row level security;
alter table vagas         enable row level security;
alter table candidaturas  enable row level security;
alter table vagas_salvas  enable row level security;
alter table publicacoes   enable row level security;
alter table tribuna       enable row level security;
alter table pacotes       enable row level security;

-- Leitura pública (anon) do conteúdo público
create policy "vagas abertas são públicas" on vagas
  for select using (status = 'aberta');
create policy "empresas são públicas" on empresas
  for select using (true);
create policy "pacotes são públicos" on pacotes
  for select using (true);
create policy "publicações aprovadas são públicas" on publicacoes
  for select using (status = 'aprovada');
create policy "tribuna é pública" on tribuna
  for select using (true);
