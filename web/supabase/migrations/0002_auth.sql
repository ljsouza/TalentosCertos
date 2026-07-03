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
