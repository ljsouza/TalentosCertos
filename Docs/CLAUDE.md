# MaringáPost Empregos — contexto do projeto

Portal/hub regional de empregos do **MaringáPost** (jornal de Maringá-PR). Protótipo de alta fidelidade em **React + Babel inline** (sem build), português do Brasil.

## Arquivo principal
- `Portal de Empregos MaringaPost.html` — shell + todo o CSS (um único `<style>` no topo). Carrega os `.jsx` via `<script type="text/babel" src>`.
- `Revisao Tecnica e Roadmap v2.html` — documento de estratégia v2.0 (stack, IA embarcada, roadmap por versões, acoplamento ao domínio). É a versão vigente.

## Estrutura de código (todos `<script type="text/babel">`)
- `data.jsx` — dados mock (VAGAS, EMPRESAS, TRIBUNA, PUBLICACOES, PACOTES…), expostos em `window`.
- `components.jsx` — UI compartilhada: `Icon`, `Logo`, `JobCard`, `Btn`, `CompanyMark`, `ShareMenu`, `MatchRing` etc. (também em `window`).
- `app.jsx` — shell: roteamento por hash, `TopNav`, `MegaMenu` (drawer de menu), `Footer`, painel de Tweaks.
- `tweaks-panel.jsx` — painel de customização visual (accent color, display font).
- `image-slot.js` — helper para slots de imagem.
- `feature-ia-vaga.jsx` — modal de criação de vaga assistida por IA.
- `feature-alcance.jsx` — feature de alcance/compartilhamento de vagas.
- `feature-talentos.jsx` — feature da aba Talento 50+.
- `feature-resposta.jsx` — feature de Triagem por Resposta Ativa (áudio/vídeo 30s).
- `screens-public.jsx` — telas públicas: home (Vagas), vaga/:id.
- `screens-candidate.jsx` — cadastro-candidato, painel-candidato.
- `screens-company.jsx` — empresa (login), painel-empresa.
- `screens-admin.jsx` — tela admin.
- `screens-content.jsx` — conteudo (Carreira & RH), artigo/:id.
- `screens-tribuna.jsx` — tribuna, tribuna-post/:id.
- `screens-express.jsx` — tela express (Na Hora).
- `screens-senior.jsx` — tela senior (Talento 50+).
- `screens-inclusao.jsx` — tela inclusao (Inclusão/PCD).
- `screens-challenge.jsx` — tela desafios.
- `screens-empresa-perfil.jsx` — empresa-perfil/:id (perfil público).

## Convenções
- **Não usar `const styles = {}`** com nome genérico — colide entre arquivos. Use nomes específicos ou estilo inline.
- Roteamento: `location.hash` → `parseHash()` → `{screen, id}`. Navegação via `go(screen, id)`.
- Para compartilhar entre scripts Babel, **exporte em `window`** (escopos não são compartilhados automaticamente). Cada arquivo faz `Object.assign(window, {...})` no fim.
- Cada aba especializada tem tema próprio com prefixo de classe e variáveis locais: `.sr-` (Talento 50+, laranja), `.ch-` (Desafios, indigo), `.pc-` (Inclusão/PCD, teal). Para nova aba, siga esse padrão.
- Persistência: `localStorage` (`mp_saved`, `mp_pubs`, `mp_candidate`, `mp_wa_tpl`). Nunca limpar chaves que não sejam suas.
- Cores/fontes vêm de variáveis CSS em `:root` e dos Tweaks (`--accent`, `--display`).
- Foco de botões: foco visível só no teclado (verde, on-brand); suprimido no clique de mouse. Regra global no `<style>`.

## Abas / rotas
home (Vagas), express (Na Hora), senior (Talento 50+), inclusao (Inclusão/PCD), desafios, vaga/:id, empresa-perfil/:id, conteudo (Carreira & RH), tribuna, tribuna-post/:id, artigo/:id, pacotes, cadastro-candidato, painel-candidato, empresa, painel-empresa, admin.

A lista completa de menus fica no botão **Menu** (ícone, canto superior esquerdo) → `MegaMenu`; a barra superior mostra atalhos (`PRIMARY_NAV` em `app.jsx`).

## Aplicação de produção (v0 em construção)
- `web/` — app **Next.js 16 (App Router)**, TypeScript, servido sob `basePath: '/empregos'`. É para onde o protótipo está sendo migrado. Build validado.
- `ARQUITETURA.md` — documento de arquitetura v0 (pastas, camadas, schema SQL, acoplamento). **Leia antes de mexer em `web/`.**
- `web/supabase/migrations/0001_init.sql` — schema Postgres inicial.
- Padrão-chave: camada `web/src/data/*` retorna mock hoje e Supabase amanhã (troca só o corpo, telas não mudam).
- Decisão: **Next.js SSR, não SPA**, por causa de SEO/indexação de vagas e artigos. Ver memória do projeto.

## Destino de produção
Deve ser servido em **maringapost.com.br/empregos** (subdiretório, mesma origem) via reverse proxy, para que a navegação compute tempo de uso e audiência no domínio principal. Stack: Next.js (Vercel) + Supabase (Postgres/auth/storage/pgvector). Detalhes completos no roadmap v2 e em `ARQUITETURA.md`.

## Roadmap resumido (v2.0)
- **v0** — Fundação (Vercel + Supabase + reverse proxy `/empregos`)
- **v1.0** — MVP: auth real, CRUD vagas, admin, e-mail (Resend)
- **v1.5** — IA Cria Vaga (Gemini/Groq) + extração de currículo
- **v2.0** — Pagamentos (Stripe/MercadoPago) + match semântico (pgvector) + WhatsApp radar
- **v2.5** — CMS editorial (Carreira & RH, Tribuna) + curadoria IA
- **v3.0** — Triagem por Resposta Ativa + score de intenção + assistente PCD
- **v4.0** — Marketplaces (Desafios, Na Hora, Talento 50+) com ranking IA e realtime
- **v5.0** — Copiloto de carreira (RAG) + agente de recrutamento autônomo
