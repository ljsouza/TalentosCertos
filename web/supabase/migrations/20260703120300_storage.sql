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
