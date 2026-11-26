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
