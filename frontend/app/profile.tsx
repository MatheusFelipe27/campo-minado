'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { getCurrentUser, type CurrentUser } from '../lib/api';

export function Profile({ token }: { token: string }) {
  const [profile, setProfile] = useState<CurrentUser>();
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getCurrentUser(token, controller.signal)
      .then(user => { setProfile(user); setError(''); })
      .catch(() => { if (!controller.signal.aborted) setError('Falha ao carregar o perfil. Recarregue a página para tentar novamente.'); });
    return () => controller.abort();
  }, [token]);

  return <>
    <p role="status">{error || (profile ? `Olá, ${profile.name}!` : 'Carregando perfil…')}</p>
    <button onClick={() => void signOut({ callbackUrl: '/login' })}>Sair</button>
  </>;
}
