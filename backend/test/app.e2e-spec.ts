import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('Acesso à API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.get(DataSource).runMigrations();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('permite consultar a saúde da API sem token', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });

  it('exige autenticação para consultar o perfil', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });
});
