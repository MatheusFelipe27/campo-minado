import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { SignJWT } from 'jose';

declare module 'next-auth' {
  interface Session {
    apiToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
    authorization: { params: { scope: 'read:user user:email' } },
  })],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider !== 'github' || !account.access_token) return false;
      const response = await fetch('https://api.github.com/user/emails?per_page=100', {
        headers: { Authorization: `Bearer ${account.access_token}` },
        cache: 'no-store',
      });
      if (!response.ok) return '/login?error=EmailLookup';
      const emails: { email: string; primary: boolean; verified: boolean }[] = await response.json();
      const primary = emails.find(entry => entry.primary && entry.verified);
      if (!primary) return '/login?error=VerifiedEmailRequired';
      user.email = primary.email;
      return true;
    },
    jwt({ token, account, user }) {
      if (account && user) {
        token.sub = account.providerAccountId;
        token.email = user.email;
        token.name = user.name || user.email;
      }
      return token;
    },
    async session({ session, token }) {
      const key = new TextEncoder().encode(process.env.API_JWT_SECRET);
      if (key.length < 32 || !token.sub || !token.email || !token.name) {
        throw new Error('Configuração ou identidade de sessão incompleta');
      }
      session.apiToken = await new SignJWT({
        provider: 'github', email: token.email, name: token.name, picture: token.picture,
      }).setProtectedHeader({ alg: 'HS256' }).setSubject(token.sub)
        .setIssuer('campo-minado-web').setAudience('campo-minado-api')
        .setIssuedAt().setExpirationTime('15m').sign(key);
      return session;
    },
  },
};
