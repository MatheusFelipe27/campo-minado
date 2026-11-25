'use client';

import { signIn } from 'next-auth/react';

export function GitHubButton() {
  return <button onClick={() => void signIn('github', { callbackUrl: '/' })}>Entrar com GitHub</button>;
}
