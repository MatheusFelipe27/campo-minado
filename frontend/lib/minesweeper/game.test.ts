import { describe, expect, it, vi } from 'vitest';
import { createGame, playMove } from './game';

const first = { type: 'reveal', position: { row: 0, column: 0 } } as const;
const flag = { type: 'flag', position: { row: 0, column: 1 } } as const;
const draw = () => 0;

describe('ciclo da partida', () => {
  it('aguarda uma revelação válida e preserva as bandeiras iniciais', () => {
    const random = vi.fn(draw);
    const marked = playMove(createGame('9x9'), flag, random);
    expect(marked.status).toBe('idle');
    expect(marked.board.flat().some(cell => cell.hasMine)).toBe(false);
    expect(playMove(marked, { ...flag, type: 'reveal' }, random)).toBe(marked);
    expect(random).not.toHaveBeenCalled();
    const started = playMove(marked, first, random);
    expect(started.status).toBe('playing');
    expect(started.board[0][0]).toMatchObject({ revealed: true, hasMine: false });
    expect(started.board[0][1].flagged).toBe(true);
    expect(marked.board[0][0].revealed).toBe(false);
  });

  it('revela todas as minas na derrota e bloqueia novas jogadas', () => {
    const started = playMove(createGame('9x9'), first, draw);
    const lost = playMove(started, { ...flag, type: 'reveal' }, draw);
    expect(lost.status).toBe('lost');
    expect(lost.board.flat().filter(cell => cell.hasMine && cell.revealed)).toHaveLength(10);
    expect(playMove(lost, flag, draw)).toBe(lost);
    expect(playMove(lost, first, draw)).toBe(lost);
  });

  it('encerra a partida na última célula segura e bloqueia novas jogadas', () => {
    let game = playMove(createGame('9x9'), first, draw);
    game.board.forEach((line, row) => line.forEach((cell, column) => {
      if (!cell.hasMine) game = playMove(game, { type: 'reveal', position: { row, column } }, draw);
    }));
    expect(game.status).toBe('won');
    expect(playMove(game, flag, draw)).toBe(game);
    expect(playMove(game, { ...flag, type: 'reveal' }, draw)).toBe(game);
  });
});
