-- v1.0 — Encerramento automático de vagas com prazo vencido (job diário).
-- Requer a extensão pg_cron habilitada (Database → Extensions → pg_cron no Supabase).

create extension if not exists pg_cron;

-- Fecha vagas abertas cujo prazo já passou.
create or replace function public.encerrar_vagas_vencidas()
returns void language sql security definer set search_path = public as $$
  update vagas
     set status = 'encerrada'
   where status = 'aberta'
     and prazo is not null
     and prazo < current_date;
$$;

-- Agenda diária às 03:00 (UTC). cron.schedule é idempotente por nome:
-- se o job 'encerrar-vagas-vencidas' já existir, é atualizado.
select cron.schedule(
  'encerrar-vagas-vencidas',
  '0 3 * * *',
  $$select public.encerrar_vagas_vencidas()$$
);

-- GANCHO DE E-MAIL (futuro, fase Resend): após encerrar, notificar o gestor.
-- Hoje só muda o status; a vaga sai da home (que mostra apenas 'aberta').
