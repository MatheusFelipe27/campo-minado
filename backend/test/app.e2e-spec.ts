import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { User } from '../src/users/user.entity';
import { Score } from '../src/scores/score.entity';
import { testAccessToken } from './access-token';

describe('Acesso à API', () => {
  let app: INestApplication;
  const accountId = randomUUID();
  const identity = { provider: 'github', providerAccountId: accountId };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.get(DataSource).runMigrations();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      try {
        await app.get(DataSource).getRepository(User).delete(identity);
      } finally {
        await app.close();
      }
    }
  });

  it('permite consultar a saúde da API sem token', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });

  it('exige autenticação para consultar o perfil', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });

  it('cria o usuário no primeiro acesso e mantém o cadastro no segundo', async () => {
    const users = app.get(DataSource).getRepository(User);
    expect(await users.countBy(identity)).toBe(0);
    const bearer = `Bearer ${testAccessToken(accountId)}`;
    const profile = () => request(app.getHttpServer()).get('/users/me').set('Authorization', bearer);
    const first = await profile().expect(200);
    const stored = await users.findOneByOrFail(identity);
    expect(first.body).toEqual({
      id: stored.id, email: `${accountId}@example.com`, name: 'Jogador de teste', image: null,
    });
    await profile().expect(200, first.body);
    expect(await users.countBy(identity)).toBe(1);
  });

  it.each([
    ['expirado', { expiresInSeconds: -60 }],
    ['assinado com outra chave', { secret: 'outra-chave-exclusiva-da-suite-de-testes' }],
  ] as const)('rejeita token %s', async (_description, options) => {
    const token = testAccessToken(accountId, options);
    await request(app.getHttpServer()).get('/users/me').set('Authorization', `Bearer ${token}`).expect(401);
  });

  describe('GET /scores/ranking', () => {
    const early = new Date('2026-01-01T12:00:00Z');
    const late = new Date('2026-01-01T13:00:00Z');
    const ana = { id: randomUUID(), name: 'Ana', image: null };
    const bia = { id: randomUUID(), name: 'Bia', image: 'https://example.com/bia.png' };

    beforeAll(async () => {
      const db = app.get(DataSource);
      await db.getRepository(User).insert([ana, bia].map(player => ({
        ...player, email: `${player.id}@example.com`, provider: 'github', providerAccountId: player.id,
      })));

      const [lowerId, higherId] = [randomUUID(), randomUUID()].sort();
      const scores = db.getRepository(Score);
      await scores.insert([
        { userId: bia.id, boardSize: '30x16', timeSeconds: 90, createdAt: early },
        ...Array.from({ length: 27 }, (_, i) => ({
          userId: ana.id, boardSize: '9x9' as const, timeSeconds: 30 - i, createdAt: early,
        })),
        { userId: ana.id, boardSize: '9x9', timeSeconds: 3, createdAt: late },
        { id: higherId, userId: bia.id, boardSize: '9x9', timeSeconds: 3, createdAt: early },
        { id: lowerId, userId: ana.id, boardSize: '9x9', timeSeconds: 3, createdAt: early },
      ]);
    });

    afterAll(async () => {
      await app.get(DataSource).getRepository(User).delete([ana.id, bia.id]);
    });

    function ranking() {
      return request(app.getHttpServer()).get('/scores/ranking')
        .set('Authorization', `Bearer ${testAccessToken(accountId)}`);
    }

    it('exige autenticação para consultar o ranking', async () => {
      await request(app.getHttpServer()).get('/scores/ranking').expect(401);
    });

    it('retorna os 30 menores tempos globais em ordem crescente', async () => {
      const { body } = await ranking().expect(200);
      expect(body.map((entry: { timeSeconds: number }) => entry.timeSeconds)).toEqual([
        3, 3, 3, ...Array.from({ length: 27 }, (_, i) => i + 4),
      ]);
    });

    it('desempata por data e depois por UUID e expõe apenas os campos públicos', async () => {
      const { body } = await ranking().expect(200);
      const tiedScore = { boardSize: '9x9', timeSeconds: 3, createdAt: early.toISOString() };
      expect(body.slice(0, 3)).toEqual([
        { ...tiedScore, userName: ana.name, userImage: ana.image },
        { ...tiedScore, userName: bia.name, userImage: bia.image },
        { ...tiedScore, userName: ana.name, userImage: ana.image, createdAt: late.toISOString() },
      ]);
    });

    it('filtra antes do limite e encontra o score avançado fora do Top 30 global', async () => {
      await ranking().query({ boardSize: '30x16' }).expect(200, [{
        userName: bia.name, userImage: bia.image, boardSize: '30x16', timeSeconds: 90, createdAt: early.toISOString(),
      }]);
    });

    it('retorna lista vazia para tamanho válido sem pontuações', async () => {
      await ranking().query({ boardSize: '16x16' }).expect(200, []);
    });

    it('rejeita um tamanho desconhecido', async () => {
      await ranking().query({ boardSize: '10x10' }).expect(400);
    });
  });

  describe('POST /scores', () => {
    let playerAccount: string;

    beforeEach(() => {
      playerAccount = randomUUID();
    });

    afterEach(async () => {
      await app.get(DataSource).getRepository(User).delete({
        provider: 'github', providerAccountId: playerAccount,
      });
    });

    function postScore(payload: object) {
      return request(app.getHttpServer()).post('/scores')
        .set('Authorization', `Bearer ${testAccessToken(playerAccount)}`)
        .send(payload);
    }

    function currentPlayer() {
      return app.get(DataSource).getRepository(User).findOneByOrFail({
        provider: 'github', providerAccountId: playerAccount,
      });
    }

    it('exige autenticação mesmo quando a pontuação é válida', async () => {
      await request(app.getHttpServer()).post('/scores')
        .send({ boardSize: '9x9', timeSeconds: 12 }).expect(401);
    });

    it.each([
      { boardSize: '9x9', timeSeconds: 1 },
      { boardSize: '16x16', timeSeconds: 2 },
      { boardSize: '30x16', timeSeconds: 3 },
    ])('aceita o mínimo de $timeSeconds s no campo $boardSize e grava para o usuário do token', async input => {
      const response = await postScore(input).expect(201);
      const player = await currentPlayer();
      const saved = await app.get(DataSource).getRepository(Score).findBy({ userId: player.id });
      expect(saved).toHaveLength(1);
      const [score] = saved;
      expect(score).toMatchObject(input);
      expect(response.body).toEqual({
        id: score.id, userId: player.id, ...input, createdAt: score.createdAt.toISOString(),
      });
    });

    it.each([
      { reason: 'tempo abaixo do mínimo no avançado', body: { boardSize: '30x16', timeSeconds: 2 } },
      { reason: 'tempo abaixo do mínimo no intermediário', body: { boardSize: '16x16', timeSeconds: 1 } },
      { reason: 'tempo zero', body: { boardSize: '9x9', timeSeconds: 0 } },
      { reason: 'tempo fracionário', body: { boardSize: '9x9', timeSeconds: 4.5 } },
      { reason: 'tempo enviado como texto', body: { boardSize: '9x9', timeSeconds: '12' } },
      { reason: 'tamanho desconhecido', body: { boardSize: '10x10', timeSeconds: 12 } },
      { reason: 'tempo ausente', body: { boardSize: '9x9' } },
      { reason: 'userId fornecido pelo cliente', body: { boardSize: '9x9', timeSeconds: 12, userId: randomUUID() } },
    ])('rejeita $reason sem gravar pontuação', async ({ body }) => {
      await postScore(body).expect(400);
      const player = await currentPlayer();
      expect(await app.get(DataSource).getRepository(Score).countBy({ userId: player.id })).toBe(0);
    });
  });
});
