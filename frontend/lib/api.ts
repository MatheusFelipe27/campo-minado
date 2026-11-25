export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export async function getCurrentUser(token: string, signal?: AbortSignal): Promise<CurrentUser> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error(`Falha ao carregar o perfil (HTTP ${response.status})`);
  return response.json();
}
