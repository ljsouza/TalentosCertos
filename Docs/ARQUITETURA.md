# MaringáPost Empregos — Arquitetura v0 (Fundação)

> Define a estrutura de pastas, as camadas, o modelo de dados e o deploy em `/empregos`.
> Base para sair do protótipo (HTML + Babel inline) para uma aplicação React real com back-end.
> Mantém todas as convenções de produto do protótipo; muda só a forma de empacotar e persistir.

---

## 1. Visão geral

```
Navegador ──HTTPS──► maringapost.com.br/empregos
                          │ (reverse proxy / rewrite)
                          ▼
                   Next.js (App Router) na Vercel
                     │           │            │
          Server Components   Route Handlers  Client Components
          (SSR/SSG: vagas,    (/empregos/api: (filtros, painéis,
           artigos, tribuna)   IA, webhooks)    formulários)
                     │           │            │
                     └───────────┴────────────┘
                                 ▼
                 Supabase: Postgres + Auth + Storage + pgvector
```

Dois serviços, ambos com plano gratuito real:
- **Vercel** — build, CDN, HTTPS, hospedagem nativa de Next.js (SSR/SSG/ISR), Route Handlers serverless/edge, `basePath`.
- **Supabase** — Postgres, autenticação, storage de arquivos, `pgvector` (match semântico nas versões futuras).

**Por que Next.js (e não SPA):** o portal vive de **SEO e conteúdo** (vagas e artigos precisam ser indexáveis e compartilháveis). Server Components renderizam cada vaga/artigo como HTML pronto no servidor → indexação forte no Google e Open Graph correto no WhatsApp/LinkedIn. Um SPA client-side entregaria HTML vazio aos buscadores.

Princípios de design:
- **Páginas públicas = Server Components** (SSR/SSG): home, vaga, empresa-perfil, conteúdo, artigo, tribuna, pacotes. Dados buscados no servidor.
- **Áreas interativas/logadas = Client Components**: filtros, painéis, formulários, Tweaks. `"use client"` só onde há estado/efeito.
- **O front nunca fala com IA/pagamento direto** — sempre via Route Handler (`app/api/*`), fácil de trocar sem mexer na UI.

---

## 2. Estrutura de pastas (Next.js 16 · App Router)

```
web/
├─ next.config.ts             # basePath: '/empregos'
├─ package.json
├─ .env.local                 # NEXT_PUBLIC_* (não versionar)
├─ public/                    # imagens estáticas (energia-solar.webp, etc.)
├─ supabase/
│  ├─ migrations/             # schema versionado (0001_init.sql)
│  └─ seed.sql                # carga inicial a partir dos mocks (a fazer)
└─ src/
   ├─ app/                    # App Router — cada pasta é uma rota
   │  ├─ layout.tsx           # shell raiz (fontes, metadata) — era parte do app.jsx
   │  ├─ page.tsx             # home / Vagas (Server Component)
   │  ├─ globals.css          # o <style> do protótipo (stub → completo)
   │  ├─ vaga/[id]/page.tsx   # SSR + generateMetadata (title/OG por vaga)
   │  ├─ express/ · senior/ · inclusao/ · desafios/         # telas públicas
   │  ├─ empresa-perfil/[id]/ · conteudo/ · artigo/[id]/    # SSR (SEO)
   │  ├─ tribuna/ · tribuna-post/[id]/ · pacotes/
   │  ├─ cadastro-candidato/ · painel-candidato/            # client/logado
   │  ├─ empresa/ · painel-empresa/ · admin/                # client/logado
   │  └─ api/                 # Route Handlers → /empregos/api/* (IA, webhooks)
   ├─ lib/
   │  ├─ supabase.ts          # cliente (mock fallback se sem env)
   │  ├─ tweaks.ts            # hook useTweaks (era tweaks-panel)
   │  └─ format.ts            # fmtN, helpers
   ├─ data/                   # camada de acesso a dados (substitui window globals)
   │  ├─ vagas.ts             # queries (mock → Supabase) — JÁ FEITO
   │  ├─ empresas.ts · candidatos.ts · publicacoes.ts
   │  └─ tribuna.ts · pacotes.ts
   ├─ components/             # era components.jsx — 1 arquivo por componente
   │  ├─ Icon.tsx · Logo.tsx · JobCard.tsx · Btn.tsx
   │  └─ ShareMenu.tsx · MatchRing.tsx · ...
   └─ features/              # era feature-*.jsx
      ├─ ia-vaga/ · alcance/ · talentos/ · resposta/
```

**Regras:**
- Uma rota = uma pasta com `page.tsx`. Acaba o `parseHash()` manual; URLs são reais e SSR.
- Páginas públicas são **Server Components** (sem `"use client"`); só marca client onde há estado/efeito/eventos.
- Um arquivo por componente — fim da colisão de `const styles`/escopo global.

---

## 3. Mapeamento protótipo → produção

| Protótipo (hoje) | Produção (Next.js) | Observação |
|---|---|---|
| `<script type="text/babel">` + `window.X` | `import { X } from '@/…'` | escopos reais, tree-shaking, type-check |
| `parseHash()` + `location.hash` | App Router — pasta por rota, `basePath: '/empregos'` | URLs reais e **renderizadas no servidor** |
| `go(screen, id)` | `<Link href>` / `useRouter().push()` | navegação nativa do Next |
| `localStorage` (`mp_saved`, `mp_pubs`, `mp_candidate`) | Supabase (tabelas + Auth) | localStorage vira cache, não fonte de verdade |
| `VAGAS`, `EMPRESAS`… em `data.jsx` | `await getVagas()` na camada `src/data/` (Server Component) | mocks viram `seed.sql` |
| Estado em `App` + props drilling | Server Components (dados) + Client Components (interação) | só `"use client"` onde há estado/efeito |
| Tweaks (`--accent`, `--display`) | mantém (CSS vars em `:root`) | recurso de protótipo, segue útil em demo |

**Estratégia de migração (validada na v0):** a camada `src/data/*` expõe as mesmas funções que o protótipo lia de `window` (`getVagas()`, `vagaById(id)`). Hoje retornam os mocks; ao plugar o Supabase, troca-se só o corpo — **as telas não mudam**. Já comprovado: `vaga/[id]` busca no servidor via `vagaById()` e renderiza HTML + Open Graph por vaga.

---

## 4. Modelo de dados (schema Postgres)

Derivado direto de `data.jsx`. Papéis de acesso: **candidato, empresa, admin** (via Supabase Auth + RLS).

### Tabelas núcleo

```sql
-- Perfis (1:1 com auth.users do Supabase)
create table perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  papel text not null check (papel in ('candidato','empresa','admin')),
  nome text not null,
  telefone text,                       -- máscara/consentimento LGPD na app
  criado_em timestamptz default now()
);

-- Empresas (recrutadores)
create table empresas (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid references perfis(id),  -- quem administra a conta
  nome text not null,
  setor text,
  sobre text,
  sobre_longo text,
  fundada int,
  funcionarios text,
  site text,
  endereco text,
  verificada boolean default false,
  responde boolean default false,
  tempo_resposta text,
  destaques text[],                    -- array de bullets
  video_youtube text,
  logo_url text,                       -- Storage; brandLogo() vira fallback
  pacote_id uuid references pacotes(id),
  criado_em timestamptz default now()
);

-- Candidatos (dados de currículo; 1:1 com perfil candidato)
create table candidatos (
  id uuid primary key references perfis(id) on delete cascade,
  area text,
  cidade text,
  resumo text,
  curriculo_url text,                  -- Storage
  radar_whatsapp boolean default false,
  radar_consentido_em timestamptz,     -- LGPD
  -- embedding vector(384)             -- (v2.0) match semântico via pgvector
  criado_em timestamptz default now()
);

-- Vagas
create table vagas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  titulo text not null,
  area text,
  cidade text,
  modalidade text check (modalidade in ('presencial','hibrido','remoto')),
  tipos text[],                        -- clt, pj, estagio, pcd, home…
  salario_min int,
  salario_max int,
  experiencia text,
  descricao text,
  requisitos text[],
  beneficios text[],
  filtro_pergunta text,                -- Resposta Ativa (opcional)
  filtro_formato text check (filtro_formato in ('audio','video')),
  destaque boolean default false,
  status text default 'aberta' check (status in ('aberta','encerrada','rascunho')),
  prazo date,                          -- encerramento automático (cron v1.0)
  -- embedding vector(384)             -- (v2.0)
  criado_em timestamptz default now()
);

-- Candidaturas (candidato ↔ vaga)
create table candidaturas (
  id uuid primary key default gen_random_uuid(),
  vaga_id uuid not null references vagas(id) on delete cascade,
  candidato_id uuid not null references candidatos(id) on delete cascade,
  status text default 'enviada' check (status in ('enviada','triagem','selecionada','recusada')),
  resposta_ativa_url text,             -- áudio/vídeo de 30s (v3.0)
  criado_em timestamptz default now(),
  unique (vaga_id, candidato_id)
);

-- Vagas salvas (era localStorage mp_saved)
create table vagas_salvas (
  candidato_id uuid references candidatos(id) on delete cascade,
  vaga_id uuid references vagas(id) on delete cascade,
  criado_em timestamptz default now(),
  primary key (candidato_id, vaga_id)
);

-- Pacotes comerciais
create table pacotes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,                  -- Atrair / Conectar / CrescerPro
  preco numeric,                       -- null = sob consulta
  periodo text,
  vagas_limite int,                    -- null = ilimitado
  recursos text[],
  destaque boolean default false
);

-- Publicações de Carreira & RH (era mp_pubs)
create table publicacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references empresas(id),  -- null = redação MaringáPost
  chapeu text,
  titulo text not null,
  lead text,
  categoria text,
  corpo text[],
  img_url text,
  keywords text[],
  status text default 'pendente' check (status in ('pendente','aprovada','reprovada')),
  motivo text,                         -- justificativa de reprovação
  publicado_em date,
  criado_em timestamptz default now()
);

-- Tribuna do Talento (creator economy)
create table tribuna (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references perfis(id),
  autor_nome text,
  cargo text,
  area text,
  tipo text,                           -- Portfólio, Análise técnica…
  titulo text not null,
  lead text,
  corpo text[],
  leituras int default 0,
  curtidas int default 0,
  comentarios int default 0,
  viral boolean default false,
  radar boolean default false,
  disponivel boolean default true,
  publicado_em date,
  criado_em timestamptz default now()
);
```

### Dados de referência (enums leves)
`areas`, `cidades`, `modalidades`, `tipos`, `categorias_publicacao` — começam como `text[]`/`check` no código (espelhando `data.jsx`); viram tabelas-lookup se precisarem de gestão pelo admin.

### RLS (Row Level Security) — princípios v0
- **candidato**: lê vagas abertas; CRUD só nas próprias candidaturas/salvos/currículo.
- **empresa**: CRUD nas próprias vagas e publicações; lê candidaturas das suas vagas.
- **admin**: acesso de moderação a publicações e gestão de usuários/empresas.
- **público (anon)**: lê vagas abertas, perfis de empresa, publicações aprovadas, tribuna — sem login.

---

## 5. Roteamento e base path `/empregos`

- React Router com `basename="/empregos"`. As 17 telas viram rotas:
  `/empregos`, `/empregos/express`, `/empregos/senior`, `/empregos/inclusao`,
  `/empregos/desafios`, `/empregos/vaga/:id`, `/empregos/empresa-perfil/:id`,
  `/empregos/conteudo`, `/empregos/tribuna`, `/empregos/tribuna-post/:id`,
  `/empregos/artigo/:id`, `/empregos/pacotes`, `/empregos/cadastro-candidato`,
  `/empregos/painel-candidato`, `/empregos/empresa`, `/empregos/painel-empresa`,
  `/empregos/admin`.
- `vite.config.ts` com `base: '/empregos/'` para que assets resolvam sob o prefixo.
- Wrapper `go(screen, id)` preservado sobre o `navigate()` do router → telas não precisam ser reescritas de imediato.

---

## 6. Acoplamento ao domínio principal

- **Reverse proxy** no `maringapost.com.br`: tudo sob `/empregos/*` encaminha para o app na Vercel. (Alternativa: `rewrites` da Vercel/Cloudflare se o site principal já estiver lá.)
- **Mesma origem** → cookies, sessão e analytics compartilhados sem cross-domain.
- **Analytics**: uma única propriedade GA4/Matomo do domínio; SPA dispara page view a cada troca de tela → tempo de uso soma ao jornal.
- **SEO**: subdiretório herda autoridade do domínio (vs. subdomínio, tratado como site à parte).

---

## 7. Variáveis de ambiente

```
# Front-end (expostas, prefixo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Route Handlers (somente servidor — nunca no bundle, sem NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=            # v1.5
RESEND_API_KEY=           # v1.0
STRIPE_SECRET_KEY=        # v2.0
```

> Segredos `service_role` e chaves de IA/pagamento vivem só nos Route Handlers. O front carrega apenas a `anon key` (protegida por RLS).

---

## 8. Checklist da v0 (Fundação)

- [x] Inicializar projeto **Next.js 16 + TS** com `basePath: '/empregos'`. *(web/)*
- [x] Extrair o `<style>` do protótipo para `web/src/app/globals.css`. *(1814 linhas)*
- [x] Fontes via `next/font` (Newsreader/Archivo/JetBrains Mono, self-hosted).
- [x] App Router + página SSR de vaga com `generateMetadata` (OG por vaga).
- [x] Schema do banco (`web/supabase/migrations/0001_init.sql`).
- [x] `seed.sql` a partir dos mocks (`web/supabase/seed.gen.mjs` → `seed.sql`).
- [x] Camada `src/data/*` com padrão mock→Supabase (`data/vagas.ts`).
- [x] Criar projeto no **Supabase**, preencher `.env.local`, rodar `0001_init.sql` + `seed.sql`. *(verificado: home SSR lê 10 vagas do banco)*
- [ ] Portar componentes (`components.jsx`) e as 17 telas.
- [ ] Auth real + políticas RLS detalhadas (entra na v1.0).
- [ ] **(você)** Reverse proxy `/empregos` + 1 propriedade de analytics.

> v0 não entrega nada visível novo ao usuário final — entrega a base sobre a qual v1.0 (MVP real) é construída sem retrabalho.
