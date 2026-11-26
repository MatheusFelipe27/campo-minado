import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { User } from '../src/users/user.entity';
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
});
