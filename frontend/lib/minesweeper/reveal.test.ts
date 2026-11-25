import { describe, expect, it } from 'vitest';
import { revealCell } from './reveal';
import { toggleFlag } from './flag';

function makeBoard() {
  return ['02*20', '03*30', '02*20'].map(line =>
    Array.from(line, symbol => ({
      hasMine: symbol === '*',
      adjacentMines: symbol === '*' ? 0 : Number(symbol),
      revealed: false,
      flagged: false,
    })),
  );
}

describe('revealCell', () => {
  it.each([0, 2])('ignora clique em célula marcada na coluna %i', column => {
    const position = { row: 0, column };
    const marked = toggleFlag(makeBoard(), position);
    const result = revealCell(marked, position);
    expect(result.board).toBe(marked);
    expect(result.hitMine).toBe(false);
  });

  it('não atravessa um vazio marcado durante a expansão', () => {
    const corridor = [Array.from({ length: 3 }, () => ({
      hasMine: false, adjacentMines: 0, revealed: false, flagged: false,
    }))];
    const marked = toggleFlag(corridor, { row: 0, column: 1 });
    const { board } = revealCell(marked, { row: 0, column: 0 });
    expect(board[0].map(cell => cell.revealed)).toEqual([true, false, false]);
    expect(board[0][1].flagged).toBe(true);
  });

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
