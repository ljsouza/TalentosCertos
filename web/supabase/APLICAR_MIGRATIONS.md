# Aplicar migrations no Supabase (via CLI)

O projeto foi adotado pelo Supabase CLI (v2.109). A base `0001–0009` já foi
aplicada manualmente (SQL Editor), então o histórico do CLI está **vazio** — é
preciso **baselinar** essas 9 antes de dar push nas 5 novas.

> **Pré-requisitos de ambiente (importante nesta máquina):**
> - Use **Node 24** (o default é o 14, que quebra o CLI): `nvm use 24.15.0`.
> - Rode a partir da pasta `web/`. O CLI está como devDependency: use
>   `npx supabase ...`. Se aparecer `ERR_INVALID_AUTH` (por causa do `.npmrc`
>   global), rode `npm config fix` uma vez, ou chame direto
>   `.\node_modules\.bin\supabase.cmd ...` (PowerShell).

## Passo a passo

```powershell
# 0) Node 24 e pasta web
nvm use 24.15.0
cd C:\Dev\TalentosCertos\web

# 1) Login (abre o navegador)
npx supabase login

# 2) Linkar ao seu projeto (pegue o ref na URL do dashboard:
#    app.supabase.com/project/<PROJECT_REF>). Pede a senha do banco.
npx supabase link --project-ref <PROJECT_REF>

# 3) Baselinar as 9 migrations já aplicadas (marca como aplicadas SEM rodar)
npx supabase migration repair --status applied `
  0001 0002 0003 0004 0005 0006 0007 0008 0009 --linked

# 4) Conferir o estado: as 9 base = Applied (remoto); as 5 novas = só Local
npx supabase migration list --linked

# 5) Ver o que SERÁ aplicado (não aplica nada)
npx supabase db push --linked --dry-run

# 6) Aplicar as 5 novas migrations
npx supabase db push --linked
```

As 5 novas (nesta ordem):
`20260703120000_tenancy` · `..0100_rls_tenant` · `..0200_empresa_status` ·
`..0300_storage` · `..0400_lgpd`.

## Depois de aplicar — validar

```powershell
# Tudo aplicado?
npx supabase migration list --linked
```

No SQL Editor do dashboard, confira:
- `select count(*) from organizacoes;` → 1 (MaringáPost).
- `select count(*) from vagas where org_id is null;` → 0 (backfill ok).
- `select status, count(*) from empresas group by status;` → existentes = `ativa`.
- Storage → buckets `logos` (público) e `curriculos` (privado) criados.

## Gotchas

- **Storage/auth policies**: o `db push` roda como `postgres` e deve conseguir
  criar as policies em `storage.objects` e a função que apaga `auth.users`. Se
  o push falhar por permissão nessas duas (`..0300_storage`, `..0400_lgpd`),
  rode o conteúdo desses dois arquivos direto no **SQL Editor** (que tem
  privilégio total) e depois `migration repair --status applied <versão>` para
  registrar no histórico.
- **App conectar ao banco**: para a aplicação sair do modo mock, crie
  `web/.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (Project Settings → API). Para os deploys: `TENANT_SLUG=maringapost` +
  `NEXT_PUBLIC_BASE_PATH=/empregos` (MaringáPost) e sem basePath (SaaS).
```
