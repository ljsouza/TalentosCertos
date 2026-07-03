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
