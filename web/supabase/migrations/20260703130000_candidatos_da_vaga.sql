-- Fase 2 — Painel de candidatos da empresa.
-- RPC que retorna os candidatos de uma vaga, ranqueados por match semântico.
-- security definer + checagem de posse: a empresa só vê candidatos das SUAS vagas
-- (expõe nome/telefone/perfil do candidato à empresa dona da vaga — disclosure
-- previsto na Política de Privacidade, ao candidatar-se). auth.uid() precisa ser
-- o dono da empresa da vaga; caso contrário, erro.

create or replace function candidatos_da_vaga(p_vaga_id uuid)
returns table (
  candidatura_id uuid,
  candidato_id uuid,
  status text,
  criado_em timestamptz,
  nome text,
  telefone text,
  area text,
  cidade text,
  resumo text,
  skills text[],
  tem_curriculo boolean,
  match int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_emb vector(768);
begin
  if not exists (
    select 1 from vagas v join empresas e on e.id = v.empresa_id
    where v.id = p_vaga_id and e.dono_id = auth.uid()
  ) then
    raise exception 'Sem permissão para ver os candidatos desta vaga.';
  end if;

  select v.embedding into v_emb from vagas v where v.id = p_vaga_id;

  return query
    select
      c.id,
      c.candidato_id,
      c.status,
      c.criado_em,
      p.nome,
      p.telefone,
      cand.area,
      cand.cidade,
      cand.resumo,
      cand.skills,
      (cand.curriculo_url is not null) as tem_curriculo,
      case
        when v_emb is not null and cand.embedding is not null
          then round((1 - (cand.embedding <=> v_emb)) * 100)::int
        else null
      end as match
    from candidaturas c
    join candidatos cand on cand.id = c.candidato_id
    join perfis p on p.id = c.candidato_id
    where c.vaga_id = p_vaga_id
    order by match desc nulls last, c.criado_em desc;
end;
$$;

revoke all on function candidatos_da_vaga(uuid) from public;
grant execute on function candidatos_da_vaga(uuid) to authenticated;
