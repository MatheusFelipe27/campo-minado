# Campo Minado

Jogo de Campo Minado em TypeScript com login pelo GitHub e ranking global por tempo. O navegador executa a partida. Ao revelar a última célula segura, o jogo envia o tamanho do campo e o tempo final à API. O resultado fica disponível no ranking, inclusive depois de sair e entrar novamente.

**Stack:** Next.js 15 (App Router), React 19, NextAuth, Tailwind CSS e shadcn/ui no frontend. NestJS 11, TypeORM e PostgreSQL 16 no backend. Os dois projetos usam TypeScript em modo `strict`.

[Executar localmente](#executar-localmente) · [Como jogar](#como-jogar) · [Testes](#testes) · [Contrato da API](#contrato-da-api) · [Diferenciais](#diferenciais)

## Executar localmente

Use Git, Docker com Compose v2.24 ou superior e uma conta GitHub com e-mail principal verificado. Os exemplos de geração de chaves e desenvolvimento com npm usam Node.js 22. Após configurar o ambiente, escolha entre executar o projeto completo com Docker ou iniciar os servidores em terminais próprios.

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

### 3A. Executar o projeto completo com Docker

Com os arquivos de ambiente preenchidos, libere as portas 3000 e 3001 encerrando eventuais servidores locais com `Ctrl+C`. Na raiz, execute:

```sh
docker compose up --build -d --wait
docker compose ps
```

O backend aguarda o PostgreSQL, aplica as migrations pendentes e inicia a API. O frontend aguarda uma resposta saudável de `/health`. Abra [o jogo](http://localhost:3000), entre com o GitHub e acesse **Ver ranking**. O volume `postgres_data` conserva os cadastros e as pontuações entre execuções.

A API usa o endereço interno `postgres:5432`. O navegador usa `http://localhost:3001` para acessar a API. Para personalizar essa URL no Compose, defina `NEXT_PUBLIC_API_URL` no ambiente do terminal antes do build. As chaves de OAuth e de sessão são carregadas dos arquivos locais ao iniciar os contêineres.

Para acompanhar a inicialização, use `docker compose logs backend frontend`. Para encerrar os serviços preservando o volume, use `docker compose down`.

### 3B. Desenvolver com npm

**Banco e API**

No **primeiro terminal**, comece na raiz do repositório. Suba o banco e entre na pasta `backend` para instalar as dependências, aplicar as migrations e iniciar a API. O comando `npm ci` usa as versões registradas no lockfile.

```sh
docker compose up -d --wait postgres
cd backend
npm ci
npm run migration:run
npm run start:dev
```

As migrations criam as tabelas `users` e `scores`, a chave estrangeira da pontuação e o índice por tamanho e tempo. O TypeORM registra as migrations aplicadas. O banco do jogo usa um volume persistente. Com a API em execução, [abrir o health check](http://localhost:3001/health) deve retornar `{"status":"ok"}`.

**Frontend**

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

- **Navegar pelo teclado:** use **Tab** para entrar no campo e as **setas** para mover o foco uma célula por vez. **Tab** sai do campo e **Shift+Tab** volta ao controle anterior.
- **Revelar:** clique com o botão esquerdo ou pressione **Enter** ou **Espaço** na célula em foco. As minas são distribuídas na primeira revelação válida, preservando a célula escolhida. O cronômetro começa nessa jogada.
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

Na página de ranking, selecione **Meus tempos** para consultar sua vitória mais rápida em cada dificuldade concluída. A opção **Ranking geral** volta ao Top 30 com o filtro de tamanho que você escolheu.

## Contrato da API

Abra a [documentação interativa do Swagger](http://localhost:3001/docs) para consultar os campos, filtros e respostas das rotas da API. O contrato também está disponível em [formato OpenAPI JSON](http://localhost:3001/docs-json).

Para experimentar uma rota protegida, entre no jogo com o GitHub e abra a [sessão do jogador](http://localhost:3000/api/auth/session) no mesmo navegador. Copie apenas o valor de `apiToken` e cole em **Authorize** no Swagger. A interface acrescenta o prefixo `Bearer` automaticamente. Experimente `GET /users/me` para conferir o perfil. O botão **Execute** em `POST /scores` grava uma pontuação real no banco em uso.

A documentação fica habilitada em desenvolvimento e no Compose local. Ao executar a API diretamente em produção, defina `SWAGGER_ENABLED=true` para habilitá-la.

Base local: `http://localhost:3001`. As rotas protegidas exigem `Authorization: Bearer <token>`.

| Método e rota | Acesso | Resposta esperada |
|---|---|---|
| `GET /health` | Público | `200` com o estado da API |
| `GET /users/me` | Autenticado | `200` com `id`, `email`, `name` e `image`. O primeiro acesso registra o usuário |
| `POST /scores` | Autenticado | `201` com `id`, `userId`, `boardSize`, `timeSeconds` e `createdAt` |
| `GET /scores/ranking` | Autenticado | `200` com até 30 registros. Aceita o filtro opcional `?boardSize=9x9`, `16x16` ou `30x16` como valor de `boardSize` |
| `GET /scores/me` | Autenticado | `200` com o menor tempo da conta em cada dificuldade concluída. Em empate, retorna a vitória mais antiga. Uma conta sem vitórias recebe `[]`. |

Corpo de exemplo para `POST /scores`:

```json
{ "boardSize": "9x9", "timeSeconds": 61 }
```

Tamanho desconhecido, tempo inválido ou campos extras como `userId` no corpo retornam `400`. Token ausente, inválido ou expirado retorna `401`. Uma consulta válida de ranking sem resultados retorna `200` com `[]`.

Cada jogador pode fazer até 5 tentativas de `POST /scores` por minuto. Ao exceder a cota, a API responde `429` e informa no cabeçalho `Retry-After` quantos segundos aguardar. A consulta ao ranking continua disponível.

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
| **API · Jest + Supertest · 27 testes e2e** | Contrato OpenAPI, Guard real, tokens expirados ou com assinatura inválida, upsert, vínculo entre jogador e score, validações, anti-cheat, limite de envios por jogador e persistência. O teste do Top 30 cria 31 pontuações e comprova que o filtro recupera uma partida fora do ranking global. |

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

- Docker Compose para iniciar PostgreSQL, API e frontend, com migrations automáticas e imagens de aplicação executadas como usuário sem privilégios.
- Swagger UI com autenticação Bearer e contrato OpenAPI gerado a partir dos controllers e DTOs.
- Limite de envios por jogador com `@nestjs/throttler`. O contador fica na memória da instância da API e reinicia com ela. Em um deploy com várias réplicas, uma cota compartilhada exigiria armazenamento comum, como Redis.
- Testes da lógica do jogo com sorteio controlado e verificação do envio de vitórias.
- Testes HTTP de ponta a ponta com NestJS, PostgreSQL isolado e as migrations usadas pela aplicação.
- [Integração contínua no GitHub Actions](.github/workflows/ci.yml) em pushes e pull requests. O frontend passa por lint, checagem de tipos, testes e build. Em paralelo, o backend passa por lint, build e testes e2e com um PostgreSQL temporário.
- Navegação por setas com uma parada de Tab no campo, foco visível, descrição das células para leitores de tela e rolagem horizontal no campo 30×16.
