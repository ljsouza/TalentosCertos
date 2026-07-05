# Deploy na Vercel — 1 app, tenant dinâmico

O app resolve o **tenant pelo host** (uma única aplicação serve todos):
- `TENANT_SLUG` (env) → override fixo (opcional).
- `<slug>.talentoscertos.com.br` → tenant por **slug** (subdomínio do SaaS).
- domínio próprio (`araucaria.pr.gov.br`, `maringapost.com.br`) → tenant por
  **`organizacoes.dominio`** (já semeado para os dois tenants).
- apex/`www` → institucional.

Adicionar uma prefeitura nova = **inserir linha em `organizacoes`** (slug + domínio)
e apontar o domínio para a Vercel. **Sem redeploy, sem env por tenant.**

> O app usa `basePath=/empregos` (default), então cada tenant fica em `<host>/empregos`.
> Pipeline = push na `main` → deploy automático.

---

## Modelo A — recomendado (produção): 1 projeto Vercel dinâmico
1. vercel.com → **Add New → Project** → importar `ljsouza/TalentosCertos` → **Root Directory: `web`**.
2. **NÃO** setar `TENANT_SLUG` (deixa a resolução dinâmica por host).
3. **Domains** do projeto (Settings → Domains): adicionar os hosts dos tenants:
   - `*.talentoscertos.com.br` (wildcard) → cada tenant vira `<slug>.talentoscertos.com.br` (exige possuir o domínio + DNS wildcard).
   - e/ou domínios próprios: `araucaria.pr.gov.br`, `maringapost.com.br` (resolvem por `organizacoes.dominio`).
4. Deploy. Novo tenant depois = só inserir em `organizacoes` + apontar o domínio.

## Modelo B — teste rápido agora (sem domínio próprio)
Na URL `*.vercel.app` não dá para carregar o tenant pelo subdomínio (não controlamos
subdomínios do `vercel.app`). Duas saídas até ter um domínio:
- **B1 (mais simples):** 2 projetos Vercel do mesmo repo, cada um com `TENANT_SLUG`
  fixo (`araucaria` / `maringapost`). Funciona direto no `.vercel.app/empregos`.
- **B2:** 1 projeto + adicionar um domínio de teste por tenant (custom domain) e
  setar `organizacoes.dominio` para ele.

> Assim que você tiver o domínio, migra para o Modelo A sem mudar código (é só
> tirar o `TENANT_SLUG` e apontar os domínios).

---

## Variáveis de ambiente (Project → Settings → Environment Variables)
```
NEXT_PUBLIC_SUPABASE_URL=https://zspnjoimfywuovtehbur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...          # publishable key
SUPABASE_SERVICE_ROLE_KEY=...                             # notificações/radar/cron
CRON_SECRET=<aleatório>                                   # protege o cron
# opcionais (mock sem elas):
RESEND_API_KEY=...    RESEND_FROM="Nome <no-reply@dominio>"
GEMINI_API_KEY=...
WHATSAPP_TOKEN=...    WHATSAPP_PHONE_ID=...               # Meta Cloud API (Prefeitura fornece)
NEXT_PUBLIC_GA_ID=...
# NEXT_PUBLIC_ROOT_DOMAIN=talentoscertos.com.br           # se o domínio-raiz do SaaS mudar
# TENANT_SLUG=araucaria                                   # SÓ no Modelo B1 (override fixo)
# NÃO setar NEXT_PUBLIC_BASE_PATH (mantém /empregos)
```

## Cron de encerramento (item 1.10)
- `web/vercel.json` agenda `GET /empregos/api/cron/encerrar-vagas` 1x/dia.
- No **Modelo A** (1 projeto) roda uma vez — ok. No **Modelo B1** (2 projetos),
  mantenha o cron em **apenas um** (encerra vagas de todos os tenants; evita e-mail duplicado).
- Requer `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY`. Opcional: desativar o `pg_cron` no Supabase.

## Supabase Auth
Authentication → URL Configuration → adicionar em **Redirect URLs** cada host de tenant:
`https://<host>/empregos/auth/callback`. Defina o **Site URL** para o host principal.

## Testar
- Home: `https://<host>/empregos`.
- Admin (SQL): `update perfis set papel='admin' where id=(select id from auth.users where email='SEU-EMAIL');`
- Fluxos: cadastro empresa → aprovar/atribuir plano em /admin → publicar vaga → candidatar → painel de candidatos → status/WhatsApp → Radar.

## Notas
- Migrations não rodam no deploy (aplicadas à parte no Supabase — já aplicadas neste projeto).
- **Rotacione a senha do banco** do Supabase (foi compartilhada durante o setup).
