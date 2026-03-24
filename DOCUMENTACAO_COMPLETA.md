# Documentacao Completa do Projeto Sport Connect

## 1. Visao geral

O projeto **Sport Connect** e uma aplicacao web/mobile para desporto. Ele junta:

- noticias desportivas
- perfis de atletas e treinadores
- equipas
- anuncios e candidaturas
- torneios
- jogos amadores

A arquitetura principal e:

- frontend React em `client/src`
- backend Express + tRPC em `server`
- base de dados Supabase/Postgres
- integracao Make para importar noticias
- app Android via Capacitor

Fluxo principal:

- utilizador abre o frontend
- frontend chama o backend
- backend fala com a base
- backend devolve resposta
- frontend mostra os dados

Fluxo das noticias:

- API externa -> Make -> webhook do backend -> tabela `news` -> Home

## 2. Estrutura geral das pastas

### Raiz

Ficheiros importantes:

- `package.json`
- `vite.config.ts`
- `capacitor.config.ts`
- `tsconfig.json`
- `drizzle.config.ts`
- `sportconnect_db.sql`
- `Integration HTTP.blueprint.json`
- `.env`

### `client/`

Contem o frontend React.

### `server/`

Contem o backend Express/tRPC.

### `shared/`

Contem tipos e constantes partilhadas.

### `scripts/`

Contem scripts de teste manual.

### `android/`

Contem o projeto Android do Capacitor.

### `drizzle/`

Contem schema/config de ORM.

### `dist/`

Contem build gerada. Nao e a fonte principal para editar.

### `vite-project/`

Parece ser um projeto paralelo/antigo e nao a base principal atual.

## 3. package.json

Arquivo: `package.json`

Define:

- nome do projeto
- scripts
- dependencias
- ferramenta de build

### Scripts principais

- `pnpm run dev`
  - sobe o frontend
- `pnpm run dev:api`
  - sobe o backend
- `pnpm run build:web`
  - builda o frontend
- `pnpm run build`
  - builda frontend e backend
- `pnpm run start`
  - arranca backend em producao
- `pnpm run check`
  - valida TypeScript
- `pnpm run android:sync`
  - sincroniza frontend com Android

### Dependencias principais

- `react`, `react-dom`
- `vite`
- `express`
- `@trpc/server`, `@trpc/client`, `@trpc/react-query`
- `zod`
- `postgres`
- `bcryptjs`
- `wouter`
- `@capacitor/core`, `@capacitor/android`

## 4. Backend

### 4.1 `server/index.ts`

E o ponto de entrada do backend.

Funcoes:

- cria servidor Express
- ativa JSON no body
- liga o tRPC
- cria health check
- cria o webhook do Make
- abre a porta `3001`

Rota importante:

- `/api/webhooks/make/news`

Ela recebe noticias do Make e grava na base.

### 4.2 `server/trpc.ts`

Configura a base do tRPC.

Funcoes:

- cria `router`
- cria `publicProcedure`
- define o contexto base

E a fundacao dos endpoints.

### 4.3 `server/routers.ts`

E o cerebro logico do backend.

Blocos principais:

- `auth`
- `sports`
- `news`
- `tm`
- `profile`

#### `auth.register`

- valida nome, email, password e role
- verifica email duplicado
- faz hash da password
- cria utilizador
- devolve dados para o frontend

#### `auth.login`

- busca utilizador por email
- compara password com `password_hash`
- devolve dados do utilizador

Observacao:

- o projeto nao usa Supabase Auth
- usa a tabela `users`

#### `news.getNewsBySport`

Busca noticias da tabela `news` por categoria:

- `futebol`
- `basquete`
- `volei`
- `geral`

#### `news.receiveNewsFromMake`

- valida noticia recebida
- grava com `db.saveNewsArticle`

#### `profile.getUserBasics`

Busca:

- nome
- email
- foto

#### `profile.getPlayerProfile`

Busca:

- posicao
- desporto
- anos de experiencia
- objetivo
- especialidade
- idade
- bio

#### `profile.updateUserBasics`

Atualiza a tabela `users`.

#### `profile.updatePlayerProfile`

Cria ou atualiza `player_profiles`.

### 4.4 `server/db.ts`

E a camada SQL.

Funcoes:

- ligar a base
- executar queries
- centralizar acesso aos dados

Suporta 2 formatos de ligacao:

- `DATABASE_URL`
- ou `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`

Isso foi importante porque a password tinha caracteres especiais.

Funcoes principais:

- `getUserByEmail`
- `getUserById`
- `createUser`
- `updateUserBasics`
- `getPlayerProfile`
- `upsertPlayerProfile`
- `getNewsBySport`
- `saveNewsArticle`

#### `saveNewsArticle`

Grava:

- title
- description
- content
- image
- source
- url
- category
- date

Se a data vier invalida:

- grava `published_at = null`

#### `getNewsBySport`

Ordena por:

- `published_at desc nulls last`

## 5. Frontend

### 5.1 `client/src/main.tsx`

Ponto de entrada do React.

Funcoes:

- monta a app
- carrega providers
- carrega CSS global

### 5.2 `client/src/App.tsx`

Mapa principal das rotas.

Decide qual pagina aparece para cada caminho.

### 5.3 `client/src/contexts/AuthContext.tsx`

Contexto global de autenticacao.

Controla:

- utilizador logado
- `login`
- `register`
- `logout`
- `updateUser`

Sem ele, cada pagina teria de gerir autenticacao sozinha.

### 5.4 `client/src/contexts/ThemeContext.tsx`

Controla o tema visual.

### 5.5 `client/src/lib/trpc.ts`

Cliente tRPC do frontend.

Regra importante:

- no Android/Capacitor usa `VITE_API_URL`
- no navegador usa `/api/trpc`

Isso resolveu o problema de Android e browser terem caminhos diferentes.

### 5.6 `client/src/lib/utils.ts`

Funcoes utilitarias, geralmente para classes CSS e helpers.

### 5.7 `client/src/services/newsService.ts`

Servico de noticias do frontend.

Funcoes:

- `fetchSportsNews()`
- `fetchNewsByCategory(...)`
- `categorizeNews(...)`

E a ponte entre Home e backend para noticias.

## 6. Paginas principais

### 6.1 `client/src/pages/Home.tsx`

Mostra noticias.

Estado atual:

- busca noticias reais da base
- usa fallback demo se necessario
- ordena pelas mais recentes
- atualiza a cada `30s`
- roda o destaque principal a cada `8s`

Problema corrigido:

- antes a Home parecia estatica
- agora ela recarrega e roda a noticia principal

### 6.2 `client/src/pages/Auth.tsx`

Pagina de login e registo.

Faz:

- formulario
- chamadas ao AuthContext
- exibicao de erros

### 6.3 `client/src/pages/PlayerProfile.tsx`

Pagina de perfil.

Faz:

- carregar dados basicos
- carregar perfil desportivo
- editar dados
- guardar na base

Campos de atleta:

- nome
- email
- foto
- desporto
- posicao
- idade
- anos de experiencia
- objetivo
- especialidade
- bio

Campos de treinador suportados:

- nome
- email
- foto
- desporto
- anos de experiencia
- bio

Campos ainda nao persistidos para treinador:

- `teamManaged`
- `trainerCertification`

Abas atuais:

- atleta: `Informacoes`, `Minhas Candidaturas`
- treinador: `Informacoes`, `Minha Equipa`, `Candidaturas`

A aba `Estatisticas` foi removida.

### 6.4 `client/src/pages/Esportes.tsx`

Pagina de desportos.

Tem abas:

- torneios
- locais
- jogos amadores

Estado atual:

- dados estaticos removidos
- mostra vazio quando nao ha dados reais
- campo `Local / Endereco` agora e livre

Ainda falta:

- ligar tudo a base de dados

### 6.5 `client/src/pages/Torneios.tsx`

Pagina dedicada a torneios.

Foi ajustada para:

- `Local`
- `Endereco`

Ainda nao persiste na base.

### 6.6 `client/src/pages/TM.tsx`

Pagina de equipas/mercado/candidaturas.

### 6.7 `client/src/pages/Times.tsx`

Pagina de equipas.

### 6.8 `client/src/pages/NotFound.tsx`

Pagina 404.

## 7. Componentes

### 7.1 `client/src/components/Layout.tsx`

Estrutura geral da aplicacao.

Controla:

- topo
- menu
- rodape

Alteracao feita:

- `Boletim Informativo` removido

### 7.2 `client/src/components/ErrorBoundary.tsx`

Captura erros React e evita quebra total da UI.

### 7.3 `client/src/components/NewsCard.tsx`

Card reutilizavel de noticia.

### 7.4 `client/src/components/Map.tsx`

Componente relacionado com mapas/localizacao.

### 7.5 `client/src/components/ManusDialog.tsx`

Componente modal/dialog.

### 7.6 `client/src/components/ui/*`

Componentes de UI reutilizaveis:

- button
- card
- tabs
- input
- dialog
- select
- textarea

Eles servem para visual e reaproveitamento, nao para a regra principal do negocio.

## 8. Hooks

### `client/src/hooks/useMobile.tsx`

Ajuda em comportamento mobile/responsivo.

### `client/src/hooks/usePersistFn.ts`

Mantem funcoes estaveis.

### `client/src/hooks/useComposition.ts`

Hook auxiliar para interacao/composicao.

## 9. Base de dados

Importante:

- o projeto atual usa Supabase/Postgres
- `sportconnect_db.sql` e um schema antigo em MySQL

Tabelas principais da base atual:

- `users`
- `player_profiles`
- `teams`
- `team_members`
- `sport_locations`
- `games`
- `game_participants`
- `announcements`
- `news`

### `users`

Finalidade:

- guardar utilizadores do app

Campos relevantes:

- `id`
- `name`
- `email`
- `profile_photo`
- `password_hash`
- `role`

Uso:

- login
- registo
- perfil

### `player_profiles`

Finalidade:

- guardar perfil desportivo

Campos:

- `user_id`
- `position`
- `sport`
- `years_of_experience`
- `objective`
- `specialty`
- `age`
- `bio`

### `teams`

Finalidade:

- guardar equipas

### `team_members`

Finalidade:

- associar utilizadores a equipas

### `sport_locations`

Finalidade:

- guardar locais para praticar

### `games`

Finalidade:

- guardar jogos

### `game_participants`

Finalidade:

- guardar participantes dos jogos

### `announcements`

Finalidade:

- guardar anuncios/candidaturas

### `news`

Finalidade:

- guardar noticias recebidas do Make

Campos principais:

- `title`
- `description`
- `content`
- `sport`
- `image_url`
- `source_url`
- `source`
- `published_at`

Uso:

- Make grava aqui
- Home le daqui

## 10. Integracao Make + noticias

Arquivo:

- `Integration HTTP.blueprint.json`

Fluxo correto:

1. `HTTP 1`
   - busca noticias numa API externa
2. `Iterator`
   - percorre `articles[]`
3. `HTTP final`
   - faz `POST` para o webhook do backend

Endpoint do backend:

- `/api/webhooks/make/news`

Quando estiver local com ngrok:

- `https://SEU-NGROK/api/webhooks/make/news`

O backend precisa estar aberto:

```powershell
pnpm.cmd run dev:api
```

O ngrok precisa estar aberto:

```powershell
ngrok.exe http 3001
```

Problemas que ja aconteceram:

- ngrok offline
- URL errada
- body JSON invalido
- `{}` nos campos
- `VAZIO`
- texto literal como `campo do modulo 5`
- data invalida

Na maioria dos casos, a causa foi configuracao do Make.

## 11. Android / Capacitor

Arquivo:

- `capacitor.config.ts`

Pasta:

- `android/`

Objetivo:

- transformar o frontend web em app Android

Fluxo:

1. `pnpm run build:web`
2. `pnpm run android:sync`
3. abrir Android Studio
4. rodar app

Arquivos importantes:

- `android/app/src/main/java/com/sportconnect/app/MainActivity.java`
- `android/app/src/main/AndroidManifest.xml`

Regra importante:

- Android usa `VITE_API_URL`
- normalmente `http://10.0.2.2:3001`

## 12. Scripts de teste

### `scripts/test-auth.mjs`

Testa:

- registo
- login

Foi importante para confirmar:

- backend
- base
- hash

### `scripts/test-webhook.mjs`

Testa:

- webhook de noticias
- gravacao na tabela `news`

## 13. Variaveis de ambiente

Variaveis importantes do `.env`:

- `PORT`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `VITE_API_URL`
- opcionalmente `MAKE_WEBHOOK_SECRET`

Sem elas:

- backend nao sobe
- app nao encontra a API
- base nao conecta

## 14. O que ja funciona

Hoje funciona:

- backend Express
- ligacao ao Supabase
- registo
- login
- perfil do utilizador
- webhook do Make
- gravacao de noticias
- leitura das noticias na Home
- refresh automatico da Home
- app Android via Capacitor

## 15. O que ainda esta incompleto

Ainda falta:

- persistencia real de `Torneios.tsx`
- ligacao real de `Esportes.tsx` a base
- estrutura completa de treinador
- bloqueio de noticias duplicadas
- deploy estavel sem ngrok

## 16. Fluxos reais do sistema

### Login

- frontend envia email/password
- backend valida
- `getUserByEmail`
- compara `password_hash`
- devolve utilizador
- AuthContext guarda sessao

### Registo

- frontend envia dados
- backend valida
- faz hash
- cria utilizador
- devolve utilizador
- frontend guarda sessao

### Perfil

- perfil abre
- frontend busca dados basicos
- frontend busca perfil desportivo
- mostra formulario
- utilizador edita
- backend guarda
- contexto e UI atualizam

### Noticias

- API externa -> Make
- Make -> webhook
- webhook -> `saveNewsArticle`
- noticia entra na tabela `news`
- Home chama `fetchSportsNews`
- backend devolve noticias
- frontend mostra

## 17. Pontos fortes tecnicos

- separacao frontend/backend
- TypeScript
- tRPC tipado
- validacao com Zod
- Supabase funcional
- Make funcional
- Android ja integrado

## 18. Limitacoes tecnicas

- autenticacao ainda simples
- nao usa Supabase Auth
- treinador incompleto
- torneios/desportos ainda nao ligados a base
- dependencia de ngrok em ambiente local

## 19. Proximos passos recomendados

1. ligar torneios ao backend
2. ligar locais e jogos amadores a base
3. impedir duplicados de noticias
4. completar modelo de treinador
5. hospedar backend
6. trocar ngrok por URL publica estavel

## 20. Resumo final

O projeto **Sport Connect** e hoje uma aplicacao React + Express + tRPC + Supabase com:

- autenticacao propria
- perfil funcional
- noticias automaticas via Make
- Home dinamica
- base pronta para crescimento
- Android via Capacitor

O que esta mais maduro:

- auth
- perfil
- noticias

O que mais precisa evolucao:

- desportos
- torneios
- locais
- jogos amadores
- deploy estavel
