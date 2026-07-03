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
