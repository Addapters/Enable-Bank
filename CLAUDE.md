# Enable Bank — Contexto do Projecto

## O que é

Plataforma colaborativa portuguesa de **doação, troca e venda de produtos de apoio** (cadeiras de rodas, andarilhos, comunicadores, etc.) para pessoas com deficiência e famílias. Construída pela **Addapters Org**.

Site em produção: https://enable-bank-bc7l.vercel.app/pt

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Estilos | Tailwind CSS v4 |
| Base de dados | Supabase (PostgreSQL + Auth + Storage) |
| i18n | next-intl (só PT por agora) |
| Mapa | Leaflet.js + OpenStreetMap (sem API key) |
| Geocodificação | Nominatim (gratuito, sem API key) |
| IA (Banky) | Anthropic Claude (API) |
| Deploy | Vercel (deploy automático a cada push para main) |

---

## Estrutura de pastas

```
src/
  app/
    [locale]/           ← todas as páginas públicas (prefixo /pt/)
      page.tsx          ← homepage
      search/           ← pesquisa com filtros
      map/              ← mapa interactivo (Leaflet)
      entidades/        ← listagem e perfil público de entidades
      publications/     ← novo anúncio, edição, detalhe
      dashboard/        ← área do utilizador
      profile/          ← edição de perfil
      auth/             ← login, registo, reset password
      admin/            ← backoffice (moderação, utilizadores, categorias, entidades)
    auth/callback/      ← rota de callback OAuth/email (fora do [locale])
    api/banky/analyze/  ← endpoint da IA Banky
  components/
    layout/             ← Navbar, Footer
    publications/       ← PublicationCard, ContactInfo, PublisherAvatar
    ui/                 ← FormField, SubmitButton
  lib/
    supabase/           ← client.ts, server.ts
    auth/actions.ts     ← login, register, logout
    publications/       ← actions.ts (criar/editar), geocode.ts
    admin/              ← actions de moderação, utilizadores, categorias, entidades
    profile/actions.ts
    data/concelhos.ts   ← lista de concelhos PT
  i18n/                 ← routing.ts, request.ts, navigation.ts
  types/database.ts     ← interfaces TypeScript de todas as tabelas
locales/pt.json         ← traduções
supabase/               ← ficheiros SQL de migração
```

---

## Base de dados (Supabase)

### Tabelas principais

- **users** — perfil de cada utilizador (ligado a auth.users via trigger)
- **entities** — perfil de entidades (ONGs, IPSS, municípios, etc.)
- **categories** — categorias/subcategorias ISO 9999:2016
- **publications** — anúncios de doação/troca/venda
- **photos** — fotos de publicações
- **contacts** — dados de contacto por utilizador
- **moderation_logs** — histórico de moderação pelo admin

### Campos relevantes em publications
`titulo, descricao, tipo (doacao/troca/venda), estado, categoria_id, publico (crianca/adulto/ambos), disponivel, preco, concelho, codigo_postal, latitude, longitude, user_id, moderacao (pendente/ativo/rejeitado/cedido)`

### RLS
Todas as tabelas têm Row Level Security activa. A função `public.is_admin()` (SECURITY DEFINER) evita recursão infinita nas policies.

### Trigger
`on_auth_user_created` — cria automaticamente uma linha em `public.users` quando um utilizador se regista.

---

## Funcionalidades construídas

### Público (sem login)
- **Homepage** com hero, pesquisa, categorias, estatísticas, CTA
- **Pesquisa** com filtros (tipo, público, categoria, concelho, disponível, entidade verificada), paginação, ordenação, link para mapa
- **Mapa** interactivo com Leaflet/OpenStreetMap, filtros client-side, popups com foto e link, legenda por tipo/entidade
- **Perfil público de entidades** (`/entidades/[slug]`) com logo, info, publicações agrupadas por categoria
- **Listagem de entidades** (`/entidades`) com verificadas em destaque
- **Detalhe de anúncio** com galeria de fotos, info de contacto, publicações relacionadas

### Utilizador autenticado
- **Registo/Login** (email+password), confirmação por email, reset de password
- **Dashboard** com lista de anúncios próprios e estado de moderação
- **Novo anúncio** com upload de fotos para Supabase Storage, código postal (geocodificação automática via Nominatim)
- **Edição de anúncio** com gestão de fotos existentes
- **Perfil** (particular e entidade) com upload de logo

### Backoffice (`/admin` — role admin)
- **Moderação** de anúncios pendentes (aprovar/rejeitar/pedir correcção)
- **Gestão de utilizadores** (ver, suspender, promover a admin)
- **Gestão de categorias** em árvore hierárquica
- **Gestão de entidades** (verificar, rejeitar)

---

## Geocodificação

- Ao criar/editar um anúncio, o `codigo_postal` (4 dígitos) é usado para geocodificar via Nominatim
- Para entidades, usa a morada completa
- As coordenadas `latitude`/`longitude` alimentam o mapa
- A geocodificação é não-bloqueante (falha silenciosa)

---

## Variáveis de ambiente

Ficheiro `.env.local` na raiz (não está no git — pedir à Isabel):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Como correr localmente

```bash
git clone https://github.com/Addapters/Enable-Bank.git
cd Enable-Bank
npm install
# Criar .env.local com as credenciais (pedir à Isabel)
npm run dev
# Abre http://localhost:3000
```

---

## Workflow de desenvolvimento

```bash
# Criar branch para nova feature
git checkout -b feature/nome-da-feature

# Fazer alterações e commit
git add .
git commit -m "feat: descrição da alteração"

# Push e criar PR no GitHub
git push origin feature/nome-da-feature
# → Criar Pull Request para main no GitHub
# → Após merge, Vercel faz deploy automático
```

---

## Decisões técnicas relevantes

- **Leaflet sem plugins** — o `leaflet.markercluster` não é compatível com Turbopack; usa-se `L.layerGroup()` nativo
- **`next/dynamic` com `ssr: false`** para o mapa (Leaflet é client-only)
- **`is_admin()` SECURITY DEFINER** — evita recursão infinita nas RLS policies quando a tabela `users` verifica o próprio role
- **Geocodificação assíncrona** — nunca bloqueia a resposta ao utilizador
- **`unaccent` extension** no PostgreSQL para geração de slugs com caracteres acentuados
- **Middleware next-intl** em `src/middleware.ts` exclui `/auth` e `/api` do prefixo de locale
