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
