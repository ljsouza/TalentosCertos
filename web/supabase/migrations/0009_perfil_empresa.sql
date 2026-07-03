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
