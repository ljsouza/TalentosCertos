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
