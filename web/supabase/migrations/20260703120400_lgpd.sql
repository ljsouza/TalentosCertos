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
