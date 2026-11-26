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
    <p role="status" className="max-w-64 border-s border-slate-600 ps-4 text-slate-300">{error || (profile ? profile.name : 'Carregando perfil…')}</p>
    <button className="min-h-11 cursor-pointer border-0 px-1 text-slate-300 hover:text-white focus-visible:outline-arcade-amber" onClick={() => void signOut({ callbackUrl: '/login' })}>Sair</button>
  </>;
}
