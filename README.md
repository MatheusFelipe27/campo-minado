# Campo Minado

Jogo de Campo Minado em TypeScript com login pelo GitHub e ranking global por tempo. O navegador executa a partida. Ao revelar a última célula segura, o jogo envia o tamanho do campo e o tempo final à API. O resultado fica disponível no ranking, inclusive depois de sair e entrar novamente.

**Stack:** Next.js 15 (App Router), React 19, NextAuth, Tailwind CSS e shadcn/ui no frontend. NestJS 11, TypeORM e PostgreSQL 16 no backend. Os dois projetos usam TypeScript em modo `strict`.

[Executar localmente](#executar-localmente) · [Como jogar](#como-jogar) · [Testes](#testes) · [Contrato da API](#contrato-da-api) · [Diferenciais](#diferenciais)

## Executar localmente

Você precisa de Git, Node.js 22, npm, Docker com Compose e uma conta GitHub com e-mail principal verificado. Os comandos de Git, Docker e npm abaixo funcionam no PowerShell e no Prompt de Comando (CMD). O Compose inicia o PostgreSQL, e cada aplicação roda em seu próprio terminal.

### 1. Clonar e preparar os arquivos de ambiente

```sh
git clone https://github.com/MatheusFelipe27/campo-minado.git
cd campo-minado
```

Na raiz do repositório recém-clonado, copie os exemplos usando o bloco do seu terminal.

**PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

**Prompt de Comando (CMD)**

```bat
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

**Linux ou macOS**

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Configurar o login pelo GitHub

Cadastre uma OAuth App com **Homepage URL** igual a `http://localhost:3000` e **Authorization callback URL** igual a `http://localhost:3000/api/auth/callback/github`. Copie o **Client ID** e gere um **Client secret** na página da aplicação. [Criar OAuth App no GitHub](https://github.com/settings/applications/new)

Gere **duas chaves independentes** executando o comando abaixo duas vezes. Use o primeiro valor em `NEXTAUTH_SECRET`. Use o segundo em `API_JWT_SECRET` nos dois arquivos locais.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variável | Arquivo | Valor ou finalidade |
|---|---|---|
| `GITHUB_ID` e `GITHUB_SECRET` | `frontend/.env.local` | Credenciais da OAuth App |
| `NEXTAUTH_URL` | `frontend/.env.local` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | `frontend/.env.local` | Primeira chave, usada para proteger a sessão |
| `API_JWT_SECRET` | Ambos | Segunda chave, compartilhada entre o servidor Next.js e o NestJS, com ao menos 32 bytes |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | `http://localhost:3001`, endereço da API usado pelo navegador |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:3000`, origem permitida pelo CORS |
| `PORT` | `backend/.env` | `3001` |
| `DATABASE_URL` | `backend/.env` | A URL do exemplo já corresponde ao serviço local `postgres`, na porta `5432` |

Os arquivos com as credenciais locais são ignorados pelo Git. Os modelos versionados estão em [frontend/.env.example](frontend/.env.example) e [backend/.env.example](backend/.env.example).

### 3. Subir o banco, aplicar as migrations e iniciar a API

No **primeiro terminal**, comece na raiz do repositório. Suba o banco e entre na pasta `backend` para instalar as dependências, aplicar as migrations e iniciar a API. O comando `npm ci` usa as versões registradas no lockfile.

```sh
docker compose up -d --wait postgres
cd backend
npm ci
npm run migration:run
npm run start:dev
```

As migrations criam as tabelas `users` e `scores`, a chave estrangeira da pontuação e o índice por tamanho e tempo. O TypeORM registra as migrations aplicadas. O banco do jogo usa um volume persistente. Com a API em execução, [abrir o health check](http://localhost:3001/health) deve retornar `{"status":"ok"}`.

### 4. Abrir o jogo

Deixe a API em execução. Abra um **segundo terminal** na raiz do repositório e entre na pasta `frontend` para iniciar o Next.js.

```sh
cd frontend
npm ci
npm run dev
```

Abra [Campo Minado local](http://localhost:3000). Ao acessar o jogo ou o ranking sem sessão, você será encaminhado para `/login`. Escolha **Entrar com GitHub**.

## Como jogar

| Campo (colunas × linhas) | Minas | Tempo mínimo aceito pela API |
|---|---:|---:|
| 9×9 | 10 | 1 s |
| 16×16 | 40 | 2 s |
| 30×16 | 99 | 3 s |

- **Revelar:** clique com o botão esquerdo. As minas são distribuídas na primeira revelação válida, preservando a célula escolhida. O cronômetro começa nessa jogada.
- **Ler o campo:** cada número indica quantas das oito posições vizinhas contêm minas. Uma célula vazia abre a região conectada e os números que a delimitam.
- **Marcar:** use o botão direito ou pressione **F** com a célula em foco. Repita para retirar a bandeira. O contador mostra o total de minas menos as bandeiras colocadas; um valor negativo indica marcações excedentes.
- **Encerrar:** revelar todas as células seguras dá a vitória e congela o tempo. Revelar uma mina mostra as demais e encerra a partida sem enviar pontuação. Trocar de dificuldade inicia um novo campo.

Após uma vitória, aguarde **Pontuação salva** e abra **Ver ranking**. A página `/ranking` mostra posição, nome, avatar, tempo, campo e data. Em **Todos os tamanhos**, entram as 30 pontuações mais rápidas do conjunto inteiro. Ao escolher uma dificuldade, o banco aplica o filtro antes do limite de 30. Um jogador pode aparecer mais de uma vez. Em caso de empate, a pontuação mais antiga vem primeiro; o UUID resolve empates de tempo e data.

## Arquitetura e decisões

| Responsabilidade | Onde encontrar |
|---|---|
| Rotas, sessão e páginas de jogo e ranking | [frontend/app](frontend/app) |
| Regras de revelação, bandeiras, vitória e ciclo da partida | [frontend/lib/minesweeper](frontend/lib/minesweeper) |
| Tabuleiro, seletor e cronômetro | [frontend/components/minesweeper](frontend/components/minesweeper) |
| Envio de uma vitória e chamadas à API | [winning-score.ts](frontend/lib/winning-score.ts) e [api.ts](frontend/lib/api.ts) |
| Guard, usuários e pontuações | [backend/src](backend/src) |
| Esquema versionado do banco | [backend/migrations](backend/migrations) |

**Identidade.** O NextAuth verifica o e-mail principal no GitHub. Ao consultar a sessão, o servidor Next.js assina um token HS256 com validade de 15 minutos para a API. O Guard global do Nest verifica assinatura, emissor, audiência e expiração. A identidade é vinculada pelo par provedor e identificador da conta. Por isso, ao salvar um score, a API obtém o usuário do token. [Configuração do NextAuth](frontend/lib/auth.ts) · [Validação no NestJS](backend/src/auth/jwt.strategy.ts)

**Tempo e confiança no cliente.** O jogo mede a duração pela diferença entre os instantes da primeira revelação e do fim da partida. O envio ocorre na transição para vitória e usa uma sessão atualizada. A API exige segundos inteiros positivos e aplica os mínimos da tabela. Esse anti-cheat detecta tempos incompatíveis com a dificuldade; a simulação do tabuleiro acontece no navegador. Se a resposta de uma gravação se perder, a interface informa a falha de confirmação e evita repetir automaticamente um envio que pode já ter sido aceito.

## Contrato da API

Base local: `http://localhost:3001`. As rotas protegidas exigem `Authorization: Bearer <token>`.

| Método e rota | Acesso | Resposta esperada |
|---|---|---|
| `GET /health` | Público | `200` com o estado da API |
| `GET /users/me` | Autenticado | `200` com `id`, `email`, `name` e `image`. O primeiro acesso registra o usuário |
| `POST /scores` | Autenticado | `201` com `id`, `userId`, `boardSize`, `timeSeconds` e `createdAt` |
| `GET /scores/ranking` | Autenticado | `200` com até 30 registros. Aceita o filtro opcional `?boardSize=9x9`, `16x16` ou `30x16` como valor de `boardSize` |

Corpo de exemplo para `POST /scores`:

```json
{ "boardSize": "9x9", "timeSeconds": 61 }
```

Tamanho desconhecido, tempo inválido ou campos extras como `userId` no corpo retornam `400`. Token ausente, inválido ou expirado retorna `401`. Uma consulta válida de ranking sem resultados retorna `200` com `[]`.

## Testes

Com as dependências instaladas, você pode executar as duas suítes sem login no GitHub. Comece cada bloco em um terminal aberto na **raiz do repositório**.

**Frontend** — entre na pasta do jogo e rode o Vitest.

```sh
cd frontend
npm test
```

**Backend** — suba o banco de testes pela raiz e entre na pasta da API. A suíte e2e inicia sua própria instância do NestJS, aplica as migrations e usa uma chave JWT exclusiva de teste.

```sh
docker compose up -d --wait postgres-test
cd backend
npm run test:e2e
```

| Suíte | Cobertura |
|---|---|
| **Frontend · Vitest · 29 testes** | Distribuição de minas, primeira revelação segura, flood fill, bandeiras, contagem, cronômetro, vitória, derrota e envio do score. Inclui perda de conexão após o envio. |
| **API · Jest + Supertest · 23 testes e2e** | Guard real, tokens expirados ou com assinatura inválida, upsert, vínculo entre jogador e score, validações, anti-cheat e persistência. O teste do Top 30 cria 31 pontuações e comprova que o filtro recupera uma partida fora do ranking global. |

O serviço `postgres-test` usa o banco `campo_minado_test` na porta `5433`, com dados temporários, separado do banco do jogo na `5432`. Para encerrá-lo após a suíte, execute `docker compose stop postgres-test`. [Testes e2e da API](backend/test/app.e2e-spec.ts)

### Executar o lint, verificar tipos e gerar os builds

No terminal do **frontend**, dentro de `frontend/`, o ESLint verifica páginas, componentes e lógica do jogo com as regras de Next.js, React e TypeScript. Pare o servidor de desenvolvimento com `Ctrl+C` antes do build. O modo de desenvolvimento e o build escrevem na mesma pasta `.next`.

```sh
npm run lint
npm run typecheck
npm run build
```

No terminal do **backend**, dentro de `backend/`, execute o lint do código da API, das migrations e dos testes. Depois compile a API com TypeScript.

```sh
npm run lint
npm run build
```

## Diferenciais

**Já disponíveis**

- Testes da lógica do jogo com sorteio controlado e verificação do envio de vitórias.
- Testes HTTP de ponta a ponta com NestJS, PostgreSQL isolado e as migrations usadas pela aplicação.
- Controles de teclado, foco visível, descrição das células para leitores de tela e rolagem horizontal do campo 30×16 em janelas estreitas.

**Próximas etapas planejadas**

- Automatizar lint, testes e builds com GitHub Actions.
- Incluir a API e o frontend no Compose para simplificar a inicialização dos três serviços.
- Documentar a API com Swagger e limitar a frequência de envio de pontuações.
- Ampliar a navegação do tabuleiro por teclado e disponibilizar o ranking pessoal.
