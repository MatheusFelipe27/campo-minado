import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSession } from 'next-auth/react';
import { createGame, playMove } from './minesweeper/game';
import { submitWinningMove } from './winning-score';

vi.mock('next-auth/react', () => ({ getSession: vi.fn() }));

function lastMove(column: number, now = 9500) {
  const playing = createGame('9x9');
  playing.status = 'playing';
  playing.startedAt = 1000;
  playing.board = [[
    { hasMine: false, adjacentMines: 1, revealed: false, flagged: false },
    { hasMine: true, adjacentMines: 0, revealed: false, flagged: false },
  ]];
  const next = playMove(playing, { type: 'reveal', position: { row: 0, column } }, Math.random, now);
  return { playing, next };
}

describe('envio da pontuação', () => {
  const request = vi.fn<typeof fetch>();
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
    vi.stubGlobal('fetch', request);
    vi.mocked(getSession).mockResolvedValue({ apiToken: 'token-de-teste', expires: '2099-01-01' });
  });
  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('envia a vitória uma vez com a sessão atual e o tempo final em segundos', async () => {
    request.mockResolvedValue(new Response(null, { status: 201 }));
    const { playing, next } = lastMove(0);
    await submitWinningMove(playing, next);
    expect(submitWinningMove(next, next)).toBeNull();
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('http://localhost:3001/scores', {
      method: 'POST',
      headers: { Authorization: 'Bearer token-de-teste', 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardSize: '9x9', timeSeconds: 8 }),
    });
  });

  it('preserva o mínimo de um segundo em uma vitória imediata', async () => {
    request.mockResolvedValue(new Response(null, { status: 201 }));
    const { playing, next } = lastMove(0, 1200);
    await submitWinningMove(playing, next);
    expect(request.mock.calls[0][1]?.body).toBe(JSON.stringify({ boardSize: '9x9', timeSeconds: 1 }));
  });

  it('não consulta a sessão nem envia score durante a partida ou na derrota', () => {
    const { playing, next } = lastMove(1);
    expect(submitWinningMove(playing, playing)).toBeNull();
    expect(submitWinningMove(playing, next)).toBeNull();
    expect(getSession).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it('informa falha de confirmação sem repetir um POST com resposta perdida', async () => {
    request.mockRejectedValue(new TypeError('Falha de rede'));
    const { playing, next } = lastMove(0);
    await expect(submitWinningMove(playing, next)).rejects.toThrow('confirmar');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('informa que a pontuação foi recusada por excesso de envios sem repetir o POST', async () => {
    request.mockResolvedValue(new Response(null, { status: 429 }));
    const { playing, next } = lastMove(0);
    await expect(submitWinningMove(playing, next)).rejects.toThrow(
      'Você atingiu o limite de envios. Esta pontuação não foi salva.',
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('não envia o resultado se a sessão expirou', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const { playing, next } = lastMove(0);
    await expect(submitWinningMove(playing, next)).rejects.toThrow('sessão');
    expect(request).not.toHaveBeenCalled();
  });
});
