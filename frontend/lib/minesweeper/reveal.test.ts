import { describe, expect, it } from 'vitest';
import { revealCell } from './reveal';

function makeBoard() {
  return ['02*20', '03*30', '02*20'].map(line =>
    Array.from(line, symbol => ({
      hasMine: symbol === '*',
      adjacentMines: symbol === '*' ? 0 : Number(symbol),
      revealed: false,
    })),
  );
}

describe('revealCell', () => {
  it('abre somente o número clicado e preserva o tabuleiro anterior', () => {
    const original = makeBoard();
    const { board, hitMine } = revealCell(original, { row: 1, column: 1 });
    expect(hitMine).toBe(false);
    expect(board[1][1].revealed).toBe(true);
    expect(board.flat().filter(cell => cell.revealed)).toHaveLength(1);
    expect(original.flat().every(cell => !cell.revealed)).toBe(true);
  });

  it('expande vazios e abre os números da borda preservando a região do outro lado', () => {
    const { board, hitMine } = revealCell(makeBoard(), { row: 0, column: 0 });
    expect(hitMine).toBe(false);
    for (const line of board) {
      expect(line.map(cell => cell.revealed)).toEqual([true, true, false, false, false]);
    }
  });

  it('sinaliza derrota ao revelar uma mina', () => {
    const { board, hitMine } = revealCell(makeBoard(), { row: 1, column: 2 });
    expect(hitMine).toBe(true);
    expect(board[1][2].revealed).toBe(true);
    expect(board.flat().filter(cell => cell.revealed)).toHaveLength(1);
  });

  it('mantém o mesmo tabuleiro quando a célula já está aberta', () => {
    const position = { row: 0, column: 0 };
    const { board } = revealCell(makeBoard(), position);
    expect(revealCell(board, position).board).toBe(board);
  });
});
