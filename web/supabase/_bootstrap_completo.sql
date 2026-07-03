-- ============================================================
-- BOOTSTRAP COMPLETO — TalentosCertos (projeto Supabase NOVO)
-- Cole TUDO no SQL Editor do Supabase e rode uma vez.
-- Ordem: schema base (0001-0009) -> seed -> tenancy/RLS/status/storage/lgpd.
-- (seed roda ANTES da tenancy porque insere sem org_id; a tenancy faz o backfill.)
-- ============================================================


-- ===== migrations/0001_init.sql =====

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

-- ===== migrations/0002_auth.sql =====

-- v1.0 — Autenticação: cria perfil + registro do papel ao registrar usuário,
-- e políticas RLS de escrita do próprio usuário.

-- Trigger: ao inserir em auth.users, cria perfis + candidatos/empresas.
-- O papel e o nome vêm dos metadados do signup (options.data).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_papel text := coalesce(new.raw_user_meta_data->>'papel', 'candidato');
  v_nome  text := coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
begin
  insert into perfis (id, papel, nome) values (new.id, v_papel, v_nome);
  if v_papel = 'empresa' then
    insert into empresas (dono_id, nome) values (new.id, v_nome);
  else
    insert into candidatos (id) values (new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: cada usuário lê/edita o próprio perfil e candidato.
create policy "perfil próprio: ler"   on perfis     for select using (auth.uid() = id);
create policy "perfil próprio: editar" on perfis     for update using (auth.uid() = id);
create policy "candidato próprio: ler"   on candidatos for select using (auth.uid() = id);
create policy "candidato próprio: editar" on candidatos for update using (auth.uid() = id);

-- Empresa: o dono administra a própria empresa.
create policy "empresa própria: editar" on empresas for update using (auth.uid() = dono_id);

-- ===== migrations/0003_vagas_rls.sql =====

-- v1.0 — Publicação de vagas: a empresa gerencia apenas as próprias vagas.
-- (A leitura pública de vagas 'aberta' já existe na 0001.)

-- Empresa lê TODAS as próprias vagas (inclui rascunho/encerrada).
create policy "empresa lê próprias vagas" on vagas for select
  using (empresa_id in (select id from empresas where dono_id = auth.uid()));

-- Empresa publica vaga na própria empresa.
create policy "empresa publica vaga" on vagas for insert
  with check (empresa_id in (select id from empresas where dono_id = auth.uid()));

-- Empresa edita/encerra as próprias vagas.
create policy "empresa edita vaga" on vagas for update
  using (empresa_id in (select id from empresas where dono_id = auth.uid()));

-- Empresa apaga as próprias vagas.
create policy "empresa apaga vaga" on vagas for delete
  using (empresa_id in (select id from empresas where dono_id = auth.uid()));

-- ===== migrations/0004_candidaturas.sql =====

-- v1.0 — Candidatura e vagas salvas.

-- Candidaturas: candidato gerencia as próprias; empresa vê/atualiza as das suas vagas.
create policy "candidato cria candidatura" on candidaturas for insert
  with check (candidato_id = auth.uid());
create policy "candidato lê próprias candidaturas" on candidaturas for select
  using (candidato_id = auth.uid());
create policy "empresa lê candidaturas das suas vagas" on candidaturas for select
  using (vaga_id in (select v.id from vagas v join empresas e on e.id = v.empresa_id where e.dono_id = auth.uid()));
create policy "empresa atualiza candidatura" on candidaturas for update
  using (vaga_id in (select v.id from vagas v join empresas e on e.id = v.empresa_id where e.dono_id = auth.uid()));

-- Vagas salvas: candidato gerencia as próprias.
create policy "candidato lê salvas" on vagas_salvas for select using (candidato_id = auth.uid());
create policy "candidato salva" on vagas_salvas for insert with check (candidato_id = auth.uid());
create policy "candidato remove salva" on vagas_salvas for delete using (candidato_id = auth.uid());

-- ===== migrations/0005_admin.sql =====

-- v1.0 — Admin: moderação de conteúdo e leitura de usuários.

-- Função is_admin() com security definer: checa o papel sem disparar RLS
-- recursiva na própria tabela perfis.
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from perfis where id = auth.uid() and papel = 'admin');
$$;

-- Admin lê TODAS as publicações (inclui pendente/reprovada) e modera.
drop policy if exists "admin lê todas publicações" on publicacoes;
create policy "admin lê todas publicações" on publicacoes for select using (public.is_admin());

drop policy if exists "admin modera publicações" on publicacoes;
create policy "admin modera publicações" on publicacoes for update using (public.is_admin());

-- Admin lê perfis e empresas (gestão de usuários).
drop policy if exists "admin lê perfis" on perfis;
create policy "admin lê perfis" on perfis for select using (public.is_admin());

-- SEGURANÇA: impede um usuário comum de mudar o próprio papel (auto-promoção).
-- Permite quando: contexto de servidor/SQL (auth.uid() null) ou o autor é admin.
create or replace function public.prevent_papel_change()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.papel is distinct from old.papel
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Não é permitido alterar o papel da conta.';
  end if;
  return new;
end;
$$;

drop trigger if exists perfis_no_papel_escalation on perfis;
create trigger perfis_no_papel_escalation
  before update on perfis
  for each row execute function public.prevent_papel_change();

-- ===== migrations/0006_cron_encerramento.sql =====

-- v1.0 — Encerramento automático de vagas com prazo vencido (job diário).
-- Requer a extensão pg_cron habilitada (Database → Extensions → pg_cron no Supabase).

create extension if not exists pg_cron;

-- Fecha vagas abertas cujo prazo já passou.
create or replace function public.encerrar_vagas_vencidas()
returns void language sql security definer set search_path = public as $$
  update vagas
     set status = 'encerrada'
   where status = 'aberta'
     and prazo is not null
     and prazo < current_date;
$$;

-- Agenda diária às 03:00 (UTC). cron.schedule é idempotente por nome:
-- se o job 'encerrar-vagas-vencidas' já existir, é atualizado.
select cron.schedule(
  'encerrar-vagas-vencidas',
  '0 3 * * *',
  $$select public.encerrar_vagas_vencidas()$$
);

-- GANCHO DE E-MAIL (futuro, fase Resend): após encerrar, notificar o gestor.
-- Hoje só muda o status; a vaga sai da home (que mostra apenas 'aberta').

-- ===== migrations/0007_candidato_skills.sql =====

-- v1.5 — Extração de currículo: campo de skills no perfil do candidato.
-- area, cidade e resumo já existem em candidatos (0001).
alter table candidatos add column if not exists skills text[] default '{}';

-- ===== migrations/0008_match_semantico.sql =====

-- v2.0 — Match semântico: embeddings 768-dim (gemini-embedding-001) + índice + função.
-- As colunas embedding eram vector(384) placeholder, sem dados — recriadas como 768.
alter table vagas drop column if exists embedding;
alter table vagas add column embedding vector(768);
alter table candidatos drop column if exists embedding;
alter table candidatos add column embedding vector(768);

-- Índice HNSW para busca por similaridade (distância de cosseno).
create index if not exists vagas_embedding_idx on vagas using hnsw (embedding vector_cosine_ops);

-- Vagas mais aderentes ao perfil do candidato logado (usa o embedding próprio).
-- stable + RLS do chamador: só enxerga vagas abertas (policy pública) e o próprio candidato.
create or replace function vagas_recomendadas(match_count int default 6)
returns table (id uuid, similaridade float)
language sql stable
set search_path = public as $$
  select v.id, 1 - (v.embedding <=> c.embedding) as similaridade
  from candidatos c, vagas v
  where c.id = auth.uid()
    and c.embedding is not null
    and v.status = 'aberta'
    and v.embedding is not null
  order by v.embedding <=> c.embedding
  limit match_count;
$$;

-- Backfill: admin grava embedding em qualquer vaga (inclui as do seed, sem dono).
-- security definer + checagem is_admin() → contorna a RLS só para admin.
create or replace function set_vaga_embedding(p_vaga_id uuid, p_emb vector(768))
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Apenas admin.'; end if;
  update vagas set embedding = p_emb where id = p_vaga_id;
end;
$$;

-- ===== migrations/0009_perfil_empresa.sql =====

-- v2.0 — Perfil institucional + conta verificada.
-- A tabela empresas já tinha as colunas institucionais (sobre, fundada, etc.)
-- e o flag `verificada`, mas faltavam policies de UPDATE. Sem elas, o dono não
-- conseguia editar o próprio perfil e o admin não conseguia verificar contas.

-- Dono edita a própria empresa.
drop policy if exists "empresa edita própria" on empresas;
create policy "empresa edita própria" on empresas for update
  using (dono_id = auth.uid())
  with check (dono_id = auth.uid());

-- Admin edita qualquer empresa (para conceder/revogar o selo verificada).
drop policy if exists "admin edita empresas" on empresas;
create policy "admin edita empresas" on empresas for update using (public.is_admin());

-- SEGURANÇA: impede o dono de se auto-verificar. `verificada` só muda em
-- contexto de servidor/SQL (auth.uid() null) ou quando o autor é admin.
create or replace function public.prevent_self_verificacao()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.verificada is distinct from old.verificada
     and auth.uid() is not null
     and not public.is_admin() then
    new.verificada := old.verificada;
  end if;
  return new;
end;
$$;

drop trigger if exists empresas_no_self_verificacao on empresas;
create trigger empresas_no_self_verificacao
  before update on empresas
  for each row execute function public.prevent_self_verificacao();

-- ===== seed.sql (dados mock; roda antes da tenancy) =====

-- seed.sql — GERADO por seed.gen.mjs a partir de data.jsx. Não editar à mão.
-- Rodar após 0001_init.sql.

insert into empresas (id, nome, setor, sobre, sobre_longo, fundada, funcionarios, site, endereco, verificada, responde, tempo_resposta, destaques, video_youtube) values
  ('00000000-0000-0000-0000-e10000000001', 'Grupo Amigão', 'Varejo / Supermercados', 'Rede de supermercados com forte presença no Norte do Paraná.', 'Uma das maiores redes de supermercados do Norte do Paraná, o Grupo Amigão emprega milhares de pessoas e investe na formação de jovens para o varejo regional.', 1979, '3.000+', 'grupoamigao.com.br', 'Maringá e região, PR', true, true, '2 dias', ARRAY['Mais de 40 anos de história','Programa Jovem Aprendiz','Plano de carreira no varejo']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000002', 'Apitec Engenharia', 'Indústria / Engenharia', 'Soluções em automação e montagem elétrica industrial.', 'Especialista em automação e montagem elétrica industrial, a Apitec entrega projetos de engenharia para indústrias de todo o Sul do Brasil, com um time técnico de alto nível.', 2005, '120', 'apitec.com.br', 'Maringá, PR', true, true, '4 dias', ARRAY['Projetos de automação industrial','Ambiente técnico de ponta','Eleita ótimo lugar para trabalhar']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000003', 'Sabin Diagnóstica', 'Saúde', 'Medicina diagnóstica de referência nacional.', 'Referência nacional em medicina diagnóstica, o Sabin é reconhecido pela cultura de pessoas e por programas estruturados de desenvolvimento de lideranças.', 1984, '7.000+', 'sabin.com.br', 'Maringá, PR', true, true, '1 dia', ARRAY['Top 10 melhores empresas para trabalhar','Formação de líderes','Saúde e bem-estar']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000004', 'Ired Telecom', 'Tecnologia / Telecom', 'Provedora de tecnologia e telecom para empresas.', 'Provedora de tecnologia e telecom corporativa, a Ired conecta negócios da região com infraestrutura própria de fibra e times de engenharia e suporte.', 2012, '80', 'iredtelecom.com.br', 'Maringá, PR', true, false, '—', ARRAY['Infraestrutura própria de fibra','Engenharia e suporte locais','Crescimento acelerado']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000005', 'Dengo Cafeteria', 'Gastronomia', 'Cafeteria e chocolateria artesanal.', 'Cafeteria e chocolateria artesanal que valoriza origem, afeto e o trabalho de quem faz o dia a dia acontecer no balcão e na cozinha.', 2017, '45', 'dengocafe.com.br', 'Maringá, PR', false, true, '3 dias', ARRAY['Produção artesanal','Abertura a 1º emprego','Ambiente acolhedor']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000006', 'Unimed Maringá', 'Saúde', 'Cooperativa de trabalho médico.', 'Cooperativa de trabalho médico, a Unimed Maringá cuida de pessoas — e investe igualmente no bem-estar de quem cuida, com benefícios e planos de carreira.', 1971, '2.500+', 'unimedmaringa.com.br', 'Maringá, PR', true, true, '2 dias', ARRAY['Maior operadora de saúde da região','Benefícios de saúde mental','Plano de carreira em saúde']::text[], 'l87XMwb4KM8'),
  ('00000000-0000-0000-0000-e10000000007', 'Solis Energia', 'Energia renovável', 'Projetos e instalação de sistemas fotovoltaicos no Norte do Paraná.', 'Projetos e instalação de sistemas fotovoltaicos no Norte do Paraná, com treinamento próprio para formar novos profissionais do setor de energia solar em expansão.', 2016, '70', 'solisenergia.com.br', 'Maringá, PR', true, true, '2 dias', ARRAY['Setor em forte expansão','Treinamento certificado','Carreira em energia renovável']::text[], 'l87XMwb4KM8');

insert into pacotes (nome, preco, periodo, vagas_limite, recursos, destaque) values
  ('Atrair', 149, '/mês', 3, ARRAY['3 vagas publicadas por mês','Publicação por 30 dias','Painel básico de candidatos','Índice de compatibilidade IA','Logo no perfil da empresa','Suporte por e-mail']::text[], false),
  ('Conectar', 389, '/mês', 12, ARRAY['12 vagas publicadas por mês','Tudo do plano Atrair','Vagas em destaque (até 4 simultâneas)','Filtro de Resposta Ativa','Radar de talentos · 5 convites/mês','Página institucional completa','Publicação editorial · 1/trimestre','Relatórios de desempenho','Suporte prioritário','Selo Empresa Verificada']::text[], true),
  ('CrescerPro', null, 'sob consulta', null, ARRAY['Vagas ilimitadas','Tudo do plano Conectar','Vaga Amplificada (multi-canal)','Score de intencionalidade','Radar de talentos ilimitado','Campanha editorial MaringáPost','Gerente de conta dedicado','Integração com ATS','API de vagas']::text[], false);

insert into vagas (empresa_id, titulo, area, cidade, modalidade, tipos, salario_min, salario_max, experiencia, descricao, requisitos, beneficios, filtro_pergunta, filtro_formato, destaque, status, prazo) values
  ('00000000-0000-0000-0000-e10000000002', 'Analista de Dados Júnior', 'Tecnologia / TI', 'Maringá', 'remoto', ARRAY['clt','home']::text[], 3500, 4800, 'Com experiência', 'Você vai estruturar dashboards, manter pipelines de dados e apoiar decisões de negócio com análises claras.', ARRAY['Excel avançado e SQL','Power BI ou Looker','Lógica e curiosidade analítica','Desejável Python']::text[], ARRAY['Vale-refeição','Plano de saúde','Home office híbrido','Day off de aniversário']::text[], 'Em 30 segundos: qual análise de dados que você fez gerou mais impacto — e por quê?', 'audio', true, 'aberta', '2026-06-17'),
  ('00000000-0000-0000-0000-e10000000001', 'Vendedor(a) Externo', 'Comercial / Vendas', 'Sarandi', 'presencial', ARRAY['clt']::text[], 2200, 3800, 'Com experiência', 'Atendimento e prospecção de clientes na região metropolitana de Maringá, com carteira ativa.', ARRAY['CNH categoria B','Experiência com vendas externas','Boa comunicação']::text[], ARRAY['Comissão agressiva','Combustível','Vale-refeição']::text[], null, null, true, 'aberta', '2026-06-10'),
  ('00000000-0000-0000-0000-e10000000006', 'Técnico(a) de Enfermagem', 'Saúde', 'Maringá', 'presencial', ARRAY['clt']::text[], 2600, 3100, 'Com experiência', 'Assistência de enfermagem em unidade hospitalar, escala 12x36.', ARRAY['COREN ativo','Experiência hospitalar','Disponibilidade para escala 12x36']::text[], ARRAY['Plano de saúde','Vale-transporte','Refeição no local']::text[], null, null, false, 'aberta', '2026-06-25'),
  ('00000000-0000-0000-0000-e10000000005', 'Estágio em Marketing', 'Marketing', 'Maringá', 'hibrido', ARRAY['estagio','primeiro']::text[], 1200, 1500, 'Sem experiência', 'Apoio às campanhas, redes sociais e produção de conteúdo da marca.', ARRAY['Cursando Marketing, Publicidade ou afins','Familiaridade com redes sociais','Boa escrita']::text[], ARRAY['Bolsa-auxílio','Vale-transporte','Ambiente jovem']::text[], null, null, false, 'aberta', '2026-06-13'),
  ('00000000-0000-0000-0000-e10000000001', 'Assistente de Logística', 'Logística', 'Paiçandu', 'presencial', ARRAY['clt']::text[], 1900, 2400, 'Com experiência', 'Controle de estoque, conferência de carga e apoio ao centro de distribuição.', ARRAY['Ensino médio completo','Experiência com estoque','Pacote Office básico']::text[], ARRAY['Vale-refeição','Vale-transporte','Plano odontológico']::text[], null, null, false, 'aberta', '2026-06-30'),
  ('00000000-0000-0000-0000-e10000000004', 'Desenvolvedor(a) Full-Stack', 'Tecnologia / TI', 'Maringá', 'remoto', ARRAY['pj','home']::text[], 6000, 9000, 'Com experiência', 'Construção de produtos web do front ao back, em time enxuto e ágil.', ARRAY['React e Node','Banco de dados relacional','Git e CI/CD','Inglês técnico']::text[], ARRAY['100% remoto','Horário flexível','Budget de estudos']::text[], 'Conte, em 30 segundos, um produto que você construiu do zero — e o que faria diferente hoje.', 'video', true, 'aberta', '2026-06-18'),
  ('00000000-0000-0000-0000-e10000000005', 'Auxiliar de Cozinha', 'Gastronomia', 'Maringá', 'presencial', ARRAY['clt','primeiro']::text[], 1600, 1900, 'Sem experiência', 'Apoio no preparo, organização e higienização da cozinha.', ARRAY['Vontade de aprender','Disponibilidade de horário','Trabalho em equipe']::text[], ARRAY['Refeição no local','Vale-transporte']::text[], null, null, false, 'aberta', '2026-06-22'),
  ('00000000-0000-0000-0000-e10000000003', 'Analista de RH', 'Recursos Humanos', 'Marialva', 'hibrido', ARRAY['clt']::text[], 3200, 4200, 'Com experiência', 'Recrutamento, seleção e rotinas de departamento pessoal.', ARRAY['Formação em RH, Psicologia ou Adm','Experiência com R&S','eSocial desejável']::text[], ARRAY['Plano de saúde','Gympass','Home office 2x/semana']::text[], null, null, false, 'aberta', '2026-07-01'),
  ('00000000-0000-0000-0000-e10000000007', 'Engenheiro(a) de Projetos Fotovoltaicos', 'Indústria / Produção', 'Maringá', 'presencial', ARRAY['clt']::text[], 7500, 10500, 'Com experiência', 'Dimensionamento e homologação de usinas solares residenciais e comerciais em toda a região.', ARRAY['Engenharia Elétrica com CREA ativo','Experiência com projetos fotovoltaicos','Domínio de AutoCAD e PVsyst','CNH B']::text[], ARRAY['Plano de saúde','Carro da empresa','Participação nos lucros']::text[], null, null, true, 'aberta', '2026-06-15'),
  ('00000000-0000-0000-0000-e10000000007', 'Técnico(a) Instalador(a) Fotovoltaico', 'Indústria / Produção', 'Mandaguari', 'presencial', ARRAY['clt','primeiro']::text[], 2800, 3600, 'Sem experiência', 'Instalação e manutenção de sistemas solares, com treinamento completo pela empresa.', ARRAY['Curso técnico em eletrotécnica ou afins','NR-10 e NR-35 (ou disposição para tirar)','Disponibilidade para viagens curtas']::text[], ARRAY['Treinamento certificado','Vale-refeição','Adicional de periculosidade']::text[], null, null, false, 'aberta', '2026-06-28');

insert into publicacoes (empresa_id, chapeu, titulo, lead, categoria, corpo, img_url, keywords, status, motivo, publicado_em) values
  (null, 'Mercado de trabalho', 'Energia solar cresce 40% em Maringá e região — e faltam profissionais', 'Expansão das usinas fotovoltaicas no Norte do Paraná abre disputa por engenheiros, técnicos e instaladores. Empresas oferecem treinamento para quem vem de outras áreas.', 'Reportagem', ARRAY['O Norte do Paraná vive uma corrida pela energia solar. Levantamento obtido pelo MaringáPost mostra que a potência instalada em sistemas fotovoltaicos na região metropolitana de Maringá cresceu 40% nos últimos doze meses — o dobro da média estadual.','O movimento é puxado por residências e pequenos comércios, mas ganhou escala com usinas de médio porte no Distrito Industrial e em municípios vizinhos. Com a expansão, integradoras locais relatam o mesmo gargalo: gente qualificada.','“Hoje a limitação não é demanda, é equipe. Para cada engenheiro que contratamos, ficam duas vagas abertas”, resume o diretor de uma integradora ouvida pela reportagem. Os salários refletem a disputa: projetos fotovoltaicos pagam até R$ 10,5 mil para engenheiros e técnicos instaladores começam na faixa de R$ 2,8 mil — com treinamento pago pela empresa.','Para quem vem de outras áreas da eletrotécnica, a transição é rápida: certificações NR-10 e NR-35, somadas a um curso de instalação fotovoltaica, abrem as portas do setor em poucos meses. Sindicatos e o Senai regional já ampliaram turmas para 2026.','A expectativa do setor é que a região dobre a capacidade instalada até 2028, sustentando um ciclo longo de contratações — e consolidando Maringá como polo de energia renovável do interior do Paraná.']::text[], 'images/energia-solar.webp', ARRAY['fotovolta','solar','energia']::text[], 'aprovada', null, '2026-06-10'),
  ('00000000-0000-0000-0000-e10000000003', 'Employer branding', 'Dentro da Sabin: como a saúde diagnóstica forma novos líderes em Maringá', 'A empresa abriu as portas para mostrar seu programa de desenvolvimento interno e os planos de carreira que retêm talentos na região.', 'Employer branding', '{}', 'images/sabin.png', ARRAY['saúde','enfermagem','rh']::text[], 'aprovada', null, '2026-06-07'),
  ('00000000-0000-0000-0000-e10000000006', 'Cultura', 'Unimed Maringá amplia benefícios de saúde mental para colaboradores', 'Programa inclui sessões de terapia, licenças dedicadas e rodas de conversa sobre bem-estar no trabalho.', 'Cultura', '{}', 'images/unimed.jpeg', ARRAY['saúde','enfermagem']::text[], 'aprovada', null, '2026-06-05'),
  (null, 'Mercado de trabalho', 'Norte do Paraná lidera abertura de vagas em tecnologia no 1º semestre', 'Levantamento da redação aponta crescimento de 18% nas contratações de TI na região metropolitana de Maringá.', 'Reportagem', '{}', 'images/mercado-ti.webp', ARRAY['dados','desenvolvedor','tecnologia']::text[], 'aprovada', null, '2026-06-08'),
  ('00000000-0000-0000-0000-e10000000001', 'Carreira', 'Programa Jovem Aprendiz do Grupo Amigão abre 60 vagas em 2026', 'Iniciativa busca formar jovens para o varejo regional, com trilha de efetivação ao fim do contrato.', 'Employer branding', '{}', null, ARRAY['vendedor','logística','aprendiz']::text[], 'pendente', null, '2026-06-09'),
  ('00000000-0000-0000-0000-e10000000002', 'Tecnologia', 'Como a Apitec automatiza a indústria do Norte do Paraná', 'Bastidores dos projetos de automação elétrica e o perfil de profissional que a empresa busca.', 'Employer branding', '{}', null, ARRAY['dados','desenvolvedor','engenharia']::text[], 'pendente', null, '2026-06-09'),
  ('00000000-0000-0000-0000-e10000000002', 'Cultura', 'Apitec é eleita uma das melhores empresas para trabalhar', 'Reconhecimento veio de pesquisa interna de clima organizacional realizada em 2026.', 'Cultura', '{}', null, ARRAY['dados','engenharia']::text[], 'reprovada', 'Faltam dados que comprovem o prêmio citado. Reenvie incluindo a fonte e o nome da pesquisa.', '2026-06-06');

insert into tribuna (autor_nome, cargo, area, tipo, titulo, lead, corpo, leituras, curtidas, comentarios, viral, radar, disponivel, publicado_em) values
  ('Marina Lopes', 'Product Designer', 'Design', 'Portfólio', 'Redesenhei o app de uma cooperativa de Maringá — e a adesão digital subiu 3x', 'Um estudo de caso completo: da pesquisa com produtores rurais à entrega final, com as decisões de design que destravaram o uso do app entre quem nunca tinha usado banco digital.', ARRAY['Quando a cooperativa me procurou, o problema parecia simples: “o app existe, mas ninguém usa”. Em duas semanas de pesquisa de campo, entrevistando produtores de soja e café do Norte do Paraná, ficou claro que o problema não era o app — era a distância entre a linguagem do produto e a realidade de quem ia usá-lo.','A primeira decisão foi abandonar a metáfora bancária. Em vez de ‘extrato’, ‘saldo disponível’ e ‘transferência’, passamos a falar em ‘o que entrou’, ‘o que dá pra usar agora’ e ‘enviar dinheiro’. Pequeno no código, enorme no comportamento.','O segundo movimento foi tornar a primeira tela útil sem login. O produtor abria o app, via a cotação do dia e o status da última entrega — antes mesmo de digitar a senha. A retomada de uso semanal saltou de 11% para 38% nos primeiros 30 dias.','O aprendizado que levo: acessibilidade não é só contraste e tamanho de fonte. É respeitar o repertório de quem usa. O melhor design é o que some — e deixa a pessoa resolver o que veio resolver.']::text[], 18400, 1240, 86, true, true, true, '2026-06-12'),
  ('Bruno Tavares', 'Engenheiro de Software', 'Tecnologia', 'Análise técnica', 'Por que migramos de microserviços de volta para um monolito — e economizamos 60% em infra', 'A história sem romantismo de uma decisão de arquitetura que contrariou o hype. O que medimos, o que deu errado e quando microserviços realmente valem a pena.', ARRAY['Em 2024 tínhamos 14 microserviços para um produto com 9 mil usuários. Pareceu moderno na hora de desenhar. Na prática, gastamos mais tempo operando a malha de serviços do que entregando funcionalidade.','A conta de infraestrutura passou de R$ 18 mil/mês. Cada deploy envolvia coordenar versões entre serviços, e um incidente simples virava caça ao fantasma entre cinco logs diferentes.','Consolidamos em um monolito modular bem organizado. Mesmo time, mesma stack, módulos com fronteiras claras. A infra caiu para R$ 7 mil/mês e o tempo médio para subir uma feature caiu pela metade.','Não é manifesto anti-microserviço. É um lembrete: arquitetura é trade-off, não tendência. Escolha pela dor que você tem, não pela palestra que você assistiu.']::text[], 24100, 1890, 212, true, true, true, '2026-06-11'),
  ('Letícia Andrade', 'Analista de Dados', 'Dados', 'Análise de mercado', 'O mapa do salário em tech no interior do Paraná: o que os dados de 2026 revelam', 'Cruzei 1.200 vagas públicas de TI da região e descobri padrões que contrariam o senso comum sobre remoto, senioridade e faixas salariais.', ARRAY['Coletei dados de 1.200 vagas de tecnologia abertas no Norte do Paraná entre janeiro e maio de 2026. A primeira surpresa: a mediana salarial do interior já é 87% da capital — contra 71% em 2023.','Vagas 100% remotas pagam, em média, 22% mais que presenciais para a mesma senioridade. Mas representam apenas 1 em cada 5 anúncios — a maioria das empresas locais ainda prefere híbrido.','O maior gargalo não é júnior nem sênior: é o pleno. Empresas disputam quem tem de 2 a 4 anos de experiência, e as faixas para esse perfil cresceram 19% em um ano.','Os dados completos e o notebook estão no meu repositório. Se você recruta na região, vale calibrar suas faixas — o mercado se moveu mais rápido do que os planos de cargos.']::text[], 15700, 980, 64, true, true, false, '2026-06-10'),
  ('Diego Moraes', 'Gerente de Operações', 'Gestão', 'Opinião', 'Demiti a reunião diária e a produtividade do time subiu. Eis o que coloquei no lugar', 'Reunião não é trabalho — é sobre o trabalho. Como reorganizei a rotina de um time de 12 pessoas em torno de assincronia e foco.', ARRAY['A daily de 15 minutos virava 40. Multiplicado por 12 pessoas e 5 dias, eram 16 horas semanais só em status. Decidi testar um mês sem ela.','No lugar, criamos um ritual assíncrono: cada pessoa escreve, até as 10h, três linhas — o que fez, o que vai fazer, onde travou. Quem precisa de ajuda marca um bloco curto e específico.','O ganho não foi só tempo. Escrever obriga a pensar; as travas viraram visíveis cedo. E quem trabalha melhor de manhã deixou de ter o foco quebrado às 9h.','Reunião boa existe — para decidir, alinhar rumo, resolver conflito. Ruim é a que poderia ser um texto. Comece cortando essa.']::text[], 9800, 720, 48, false, false, true, '2026-06-09'),
  ('Patrícia Lima', 'Redatora & Estrategista', 'Marketing', 'Tutorial', 'Escrevi 200 anúncios de vaga. Os 7 erros que afastam bons candidatos', 'A descrição da vaga é a primeira impressão da sua empresa. Um guia prático de copy para RH que quer atrair — e não espantar — talento.', ARRAY['Erro 1: a lista interminável de requisitos. Ninguém preenche 100%. Separe ‘essencial’ de ‘desejável’ e veja sua taxa de candidatura subir.','Erro 2: falar só do que a empresa quer. Inverta. Comece pelo que o candidato ganha — problema interessante, autonomia, aprendizado, faixa salarial real.','Erro 3: jargão vazio. ‘Ambiente dinâmico’ e ‘vista a camisa’ não dizem nada. Mostre um dia real do trabalho, com exemplos concretos.','O resto dos erros — e os modelos prontos que uso — estão no fim do texto. Copy de vaga é marketing: você está vendendo um lugar para a pessoa passar um terço da vida.']::text[], 13200, 1100, 73, true, false, true, '2026-06-08'),
  ('Rafael Costa', 'Engenheiro Fotovoltaico', 'Engenharia', 'Análise técnica', 'Dimensionei 40 usinas solares no Paraná: o erro de projeto que vejo em quase todas', 'Sombreamento parcial é subestimado e custa caro. Um guia visual de como o traçado dos módulos define o retorno do investimento.', ARRAY['Sombra de uma única chaminé ou árvore pode derrubar a geração de uma fileira inteira de módulos, dependendo de como o sistema foi ligado. Vejo esse erro em 7 de cada 10 projetos que audito.','A causa é quase sempre a mesma: string mal planejada. Agrupar módulos que recebem sombra em horários diferentes na mesma série penaliza todo o conjunto.','A correção custa pouco na fase de projeto e quase nada em otimizadores quando pensada cedo. Depois de instalado, vira prejuízo recorrente por 25 anos.','Anexei os diagramas de traçado que uso como referência. Engenharia solar é detalhe: o sol é de graça, mas o projeto ruim cobra caro todo mês.']::text[], 8100, 540, 39, false, true, true, '2026-06-07');

-- ===== migrations/20260703120000_tenancy.sql =====

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

-- ===== migrations/20260703120100_rls_tenant.sql =====

-- Fase 0 — RLS por tenant.
-- Escopa o acesso ao tenant do usuário logado. As políticas de posse já isolam
-- naturalmente cada usuário (dono_id / candidato_id = auth.uid()); o buraco real
-- é o ADMIN, que na 0005/0009 enxerga TODOS os tenants. Aqui o admin passa a ver
-- apenas o próprio tenant. (Super-admin cross-tenant fica para a Fase 4.)
--
-- Leitura pública (anon) de conteúdo público — vagas abertas, perfis de empresa,
-- publicações aprovadas, tribuna, pacotes — permanece permissiva no banco (dado
-- é público por natureza); a filtragem por tenant nessas telas é feita na camada
-- src/data/* do app, a partir do subdomínio/host resolvido no middleware.

-- ── Org do usuário logado (contexto autenticado) ────────────────────────────
-- security definer: lê perfis sem disparar RLS recursiva.
create or replace function public.current_org()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from perfis where id = auth.uid();
$$;

-- ── Admin escopado ao próprio tenant ────────────────────────────────────────
-- Publicações: admin lê/modera só as do seu tenant.
drop policy if exists "admin lê todas publicações" on publicacoes;
create policy "admin lê publicações do tenant" on publicacoes for select
  using (public.is_admin() and org_id = public.current_org());

drop policy if exists "admin modera publicações" on publicacoes;
create policy "admin modera publicações do tenant" on publicacoes for update
  using (public.is_admin() and org_id = public.current_org());

-- Perfis: admin lê só os perfis do seu tenant (gestão de usuários).
drop policy if exists "admin lê perfis" on perfis;
create policy "admin lê perfis do tenant" on perfis for select
  using (public.is_admin() and org_id = public.current_org());

-- Empresas: admin edita só as empresas do seu tenant (verificação/gestão).
drop policy if exists "admin edita empresas" on empresas;
create policy "admin edita empresas do tenant" on empresas for update
  using (public.is_admin() and org_id = public.current_org());

-- ── Recomendações escopadas por tenant ──────────────────────────────────────
-- Redefine a RPC da 0008 para só recomendar vagas do mesmo tenant do candidato.
create or replace function vagas_recomendadas(match_count int default 6)
returns table (id uuid, similaridade float)
language sql stable
set search_path = public as $$
  select v.id, 1 - (v.embedding <=> c.embedding) as similaridade
  from candidatos c, vagas v
  where c.id = auth.uid()
    and c.embedding is not null
    and v.status = 'aberta'
    and v.embedding is not null
    and v.org_id = c.org_id
  order by v.embedding <=> c.embedding
  limit match_count;
$$;

-- ===== migrations/20260703120200_empresa_status.sql =====

-- Fase 1 — Aprovação e gestão de empresas.
-- Adiciona o ciclo de vida da conta da empresa (fila de aprovação + bloqueio),
-- base para a cobrança manual (admin aprova a empresa e atribui um pacote).

-- status: novas empresas nascem 'pendente' (default) e aguardam aprovação do
-- admin; as já existentes são promovidas a 'ativa' (já estavam no ar).
alter table empresas
  add column if not exists status text not null default 'pendente'
  check (status in ('pendente', 'ativa', 'bloqueada'));

update empresas set status = 'ativa' where status = 'pendente';

create index if not exists empresas_status_idx on empresas(status);

-- Visibilidade pública: só vagas abertas de empresas ATIVAS aparecem.
-- (Empresas pendentes ainda não publicam; bloqueadas somem das listagens sem
-- perder o estado das vagas.) Substitui a policy da 0001.
drop policy if exists "vagas abertas são públicas" on vagas;
drop policy if exists "vagas abertas de empresas ativas são públicas" on vagas;
create policy "vagas abertas de empresas ativas são públicas" on vagas for select
  using (
    status = 'aberta'
    and empresa_id in (select id from empresas where status = 'ativa')
  );

-- ===== migrations/20260703120300_storage.sql =====

-- Fase 1 — Supabase Storage: currículos (privado) e logos (público).
-- Buckets + policies em storage.objects. Rodar no SQL Editor do Supabase
-- (contexto com privilégio sobre o schema storage).

-- ── Buckets ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos',      'logos',      true,  2 * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('curriculos', 'curriculos', false, 5 * 1024 * 1024, array['application/pdf'])
on conflict (id) do nothing;

-- ── Logos (público para ler; dono da empresa escreve) ───────────────────────
-- Convenção de caminho: logos/<empresa_id>/<arquivo>
drop policy if exists "logos: leitura pública" on storage.objects;
create policy "logos: leitura pública" on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "logos: dono envia" on storage.objects;
create policy "logos: dono envia" on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and exists (
      select 1 from public.empresas e
      where e.id::text = (storage.foldername(name))[1] and e.dono_id = auth.uid()
    )
  );

drop policy if exists "logos: dono atualiza" on storage.objects;
create policy "logos: dono atualiza" on storage.objects for update
  using (
    bucket_id = 'logos'
    and exists (
      select 1 from public.empresas e
      where e.id::text = (storage.foldername(name))[1] and e.dono_id = auth.uid()
    )
  );

drop policy if exists "logos: dono remove" on storage.objects;
create policy "logos: dono remove" on storage.objects for delete
  using (
    bucket_id = 'logos'
    and exists (
      select 1 from public.empresas e
      where e.id::text = (storage.foldername(name))[1] and e.dono_id = auth.uid()
    )
  );

-- ── Currículos (privado; só o próprio candidato acessa) ─────────────────────
-- Convenção de caminho: curriculos/<user_id>/<arquivo>. Empresas visualizam via
-- signed URL gerada no servidor ao analisar a candidatura (fase posterior).
drop policy if exists "curriculos: dono acessa" on storage.objects;
create policy "curriculos: dono acessa" on storage.objects for select
  using (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "curriculos: dono envia" on storage.objects;
create policy "curriculos: dono envia" on storage.objects for insert
  with check (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "curriculos: dono atualiza" on storage.objects;
create policy "curriculos: dono atualiza" on storage.objects for update
  using (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "curriculos: dono remove" on storage.objects;
create policy "curriculos: dono remove" on storage.objects for delete
  using (bucket_id = 'curriculos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== migrations/20260703120400_lgpd.sql =====

-- Fase 1 — LGPD: exclusão de conta (direito ao esquecimento).
-- Função security definer que apaga TODOS os dados do usuário logado, na ordem
-- de dependência, e remove a conta de auth.users. Escopada a auth.uid() — o
-- usuário só apaga a si mesmo (não precisa da service_role no app).

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Sem sessão ativa.';
  end if;

  -- Conteúdo autoral sem cascade natural.
  delete from tribuna where autor_id = v_uid;

  -- Empresas do usuário: publicações primeiro, depois a empresa
  -- (cascade → vagas → candidaturas das vagas).
  delete from publicacoes where empresa_id in (select id from empresas where dono_id = v_uid);
  delete from empresas where dono_id = v_uid;

  -- Remove o usuário: cascade em perfis → candidatos → candidaturas/vagas_salvas.
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.excluir_minha_conta() from public;
grant execute on function public.excluir_minha_conta() to authenticated;
