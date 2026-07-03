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
