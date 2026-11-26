import { createHmac } from 'node:crypto';

export function testAccessToken(accountId: string, {
  expiresInSeconds = 900,
  secret = process.env.API_JWT_SECRET,
} = {}) {
  if (!secret) throw new Error('Configure a chave JWT da suíte de testes');
  const header = { alg: 'HS256', typ: 'JWT' };
  const claims = {
    sub: accountId,
    provider: 'github',
    email: `${accountId}@example.com`,
    name: 'Jogador de teste',
    picture: null,
    iss: 'campo-minado-web',
    aud: 'campo-minado-api',
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const content = `${encode(header)}.${encode(claims)}`;
  const signature = createHmac('sha256', secret).update(content).digest('base64url');
  return `${content}.${signature}`;
}
