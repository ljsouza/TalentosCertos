-- v2.0 — Match semântico: embeddings 768-dim (gemini-embedding-001) + índice + função.
-- As colunas embedding eram vector(384) placeholder, sem dados — recriadas como 768.
alter table vagas drop column if exists embedding;
alter table vagas add column embedding vector(768);
alter table candidatos drop column if exists embedding;
alter table candidatos add column embedding vector(768);

-- Índice HNSW para busca por similaridade (distância de cosseno).
create index if not exists vagas_embedding_idx on vagas using hnsw (embedding vector_cosine_ops);

-- Vagas mais aderentes ao perfil do candidato logado (usa o embedding próprio).
-- stable + RLS do chamador: só enxerga vagas abertas (policy pública) e o próprio candidato.
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
  order by v.embedding <=> c.embedding
  limit match_count;
$$;

-- Backfill: admin grava embedding em qualquer vaga (inclui as do seed, sem dono).
-- security definer + checagem is_admin() → contorna a RLS só para admin.
create or replace function set_vaga_embedding(p_vaga_id uuid, p_emb vector(768))
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Apenas admin.'; end if;
  update vagas set embedding = p_emb where id = p_vaga_id;
end;
$$;
