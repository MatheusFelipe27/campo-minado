import { getSession } from 'next-auth/react';
import type { BoardSize } from './minesweeper/board';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export interface PersonalBest {
  boardSize: BoardSize;
  timeSeconds: number;
  createdAt: string;
}

export interface RankingEntry extends PersonalBest {
  userName: string;
  userImage: string | null;
}

async function fetchRanking<T>(url: URL, signal: AbortSignal): Promise<T[]> {
  const session = await getSession();
  if (!session?.apiToken) throw new Error('Entre novamente para consultar o ranking.');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.apiToken}` },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error(`Falha ao consultar o ranking (HTTP ${response.status}).`);
  return response.json();
}

export function getRanking(boardSize: BoardSize | undefined, signal: AbortSignal) {
  const url = new URL('/scores/ranking', process.env.NEXT_PUBLIC_API_URL);
  if (boardSize) url.searchParams.set('boardSize', boardSize);
  return fetchRanking<RankingEntry>(url, signal);
}

export function getPersonalBests(signal: AbortSignal) {
  return fetchRanking<PersonalBest>(new URL('/scores/me', process.env.NEXT_PUBLIC_API_URL), signal);
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

export async function saveScore(boardSize: BoardSize, timeSeconds: number): Promise<void> {
  const session = await getSession();
  if (!session?.apiToken) throw new Error('Não foi possível obter a sessão para enviar a pontuação.');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scores`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ boardSize, timeSeconds }),
  }).catch(() => {
    throw new Error('Falha na conexão. Não foi possível confirmar se a pontuação foi salva.');
  });
  if (response.status === 400) throw new Error('A API recusou a pontuação para este tempo e tamanho.');
  if (response.status === 401) throw new Error('A sessão foi recusada pela API. Entre novamente.');
  if (response.status === 429) throw new Error('Você atingiu o limite de envios. Esta pontuação não foi salva.');
  if (response.status !== 201) throw new Error('Não foi possível confirmar o salvamento da pontuação.');
}
