import { describe, expect, it } from 'vitest';
import { toggleFlag } from './flag';
import { revealCell } from './reveal';
import { checkVictory } from './victory';

function makeBoard() {
  return [[
    { hasMine: false, adjacentMines: 1, revealed: false, flagged: false },
    { hasMine: true, adjacentMines: 0, revealed: false, flagged: false },
  ]];
}

const safe = { row: 0, column: 0 };
const mine = { row: 0, column: 1 };

describe('checkVictory', () => {
  it('reconhece a vitória ao abrir a última célula segura sem usar bandeiras', () => {
    const { board } = revealCell(makeBoard(), safe);
    expect(checkVictory(board)).toBe(true);
  });

  it('mantém a partida em andamento com uma célula segura fechada, mesmo marcada', () => {
    const board = makeBoard();
    expect(checkVictory(board)).toBe(false);
    expect(checkVictory(toggleFlag(board, safe))).toBe(false);
  });

  it('impede vitória quando há uma mina revelada mesmo com todas as seguras abertas', () => {
    const afterMine = revealCell(makeBoard(), mine);
    expect(checkVictory(afterMine.board)).toBe(false);
    const allRevealed = revealCell(afterMine.board, safe);
    expect(checkVictory(allRevealed.board)).toBe(false);
  });
});
