# Deploy na Vercel (pipeline por push) — ambiente de teste

Dois projetos Vercel a partir do **mesmo repositório**, um por tenant. O pipeline
é a integração GitHub↔Vercel: **push na `main` → deploy automático** de ambos
(cada um com seu `TENANT_SLUG`). PRs geram Preview Deploys.

| Projeto Vercel | TENANT_SLUG | URL de teste (exemplo) |
|---|---|---|
| `talentoscertos-araucaria` | `araucaria` | `https://<proj>.vercel.app/empregos` |
| `talentoscertos-maringapost` | `maringapost` | `https://<proj>.vercel.app/empregos` |

> O app usa `basePath=/empregos` (default), então a home fica em `.../empregos`.

## 1. Criar cada projeto (vercel.com → Add New → Project)
1. **Import** do repositório `ljsouza/TalentosCertos`.
2. **Root Directory: `web`** (importante — o app está em `web/`, não na raiz).
3. Framework: **Next.js** (detectado automaticamente). Build/Output: padrão.
4. Repita para o 2º projeto (mesmo repo, mesmo Root Directory).

## 2. Variáveis de ambiente (Project → Settings → Environment Variables)

**Iguais nos dois projetos** (Supabase e integrações):
```
NEXT_PUBLIC_SUPABASE_URL=https://zspnjoimfywuovtehbur.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...        # a publishable key
SUPABASE_SERVICE_ROLE_KEY=...                            # Supabase → Settings → API → service_role (notificações/radar/cron)
CRON_SECRET=<gere um valor aleatório>                    # protege o cron
# Opcionais (sem elas, degrada para mock/log):
RESEND_API_KEY=...            RESEND_FROM="Nome <no-reply@dominio>"
GEMINI_API_KEY=...
WHATSAPP_TOKEN=...            WHATSAPP_PHONE_ID=...       # Meta Cloud API (a Prefeitura fornece)
NEXT_PUBLIC_GA_ID=...                                    # analytics (opcional)
```

**Diferente por projeto:**
```
# Projeto Araucária:
TENANT_SLUG=araucaria
# Projeto MaringáPost:
TENANT_SLUG=maringapost
```

> **NÃO** defina `NEXT_PUBLIC_BASE_PATH` (mantém o default `/empregos`, que os
> caminhos internos — OAuth callback, chamadas de IA — assumem).

## 3. Cron de encerramento (item 1.10)
- O `web/vercel.json` já agenda `GET /empregos/api/cron/encerrar-vagas` 1x/dia (06:00 UTC).
- **Habilite o cron em APENAS UM dos projetos** (ele encerra vagas de todos os
  tenants). No outro projeto, remova o bloco `crons` (ou desative), para não
  duplicar e-mails. Requer `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` no projeto que roda.
- Opcional: desativar o `pg_cron` `encerrar-vagas-vencidas` no Supabase (para o
  e-mail sempre partir da rota).

## 4. Supabase Auth (para OAuth e links de e-mail)
Supabase → Authentication → URL Configuration:
- **Site URL** e **Redirect URLs**: adicione, para cada projeto,
  `https://<proj>.vercel.app/empregos/auth/callback`.
- Sem isso, login social e links de confirmação apontam para o local errado.

## 5. Testar
- Home: `https://<proj>.vercel.app/empregos` (Araucária mostra branding/vagas da prefeitura; MaringáPost, as suas).
- Criar admin (SQL): `update perfis set papel='admin' where id=(select id from auth.users where email='SEU-EMAIL');`
- Fluxos: cadastro empresa → aprovar/atribuir plano no /admin → publicar vaga → candidatar → painel de candidatos → status/WhatsApp.

## Notas
- Migrations do banco **não** rodam no deploy — são aplicadas à parte no Supabase (já aplicadas neste projeto).
- **Rotacione a senha do banco** do Supabase (foi compartilhada em chat durante o setup).
- Pipeline: cada push na `main` reimplanta os dois projetos; PRs geram previews para revisão.
