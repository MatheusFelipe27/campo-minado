import { describe, expect, it } from 'vitest';
import { generateBoard } from './board';

describe('generateBoard', () => {
  const configurations = [
    ['9x9', 9, 9, 10],
    ['16x16', 16, 16, 40],
    ['30x16', 30, 16, 99],
  ] as const;

  for (const [size, columns, rows, mines] of configurations) {
    it(`gera ${size} com ${mines} minas e protege o primeiro clique`, () => {
      const positions = [
        { row: 0, column: 0 },
        { row: rows - 1, column: columns - 1 },
        { row: 0, column: Math.floor(columns / 2) },
        { row: Math.floor(rows / 2), column: Math.floor(columns / 2) },
      ];
      for (const position of positions) {
        for (const draw of [0, 0.5, 0.999999]) {
          const board = generateBoard(size, position, () => draw);
          expect(board).toHaveLength(rows);
          expect(board.every(row => row.length === columns)).toBe(true);
          expect(board.flat().filter(cell => cell.hasMine)).toHaveLength(mines);
          expect(board[position.row][position.column].hasMine).toBe(false);
        }
      }
    });
  }

  it('conta minas ortogonais e diagonais sem atravessar as bordas', () => {
    // Sorteando sempre a primeira candidata: nove minas na linha 0 e uma em (1, 0).
    const board = generateBoard('9x9', { row: 8, column: 8 }, () => 0);
    expect(board[1][1].adjacentMines).toBe(4);
    expect(board[1][8].adjacentMines).toBe(2);
    expect(board[2][0].adjacentMines).toBe(1);
    expect(board[2][1].adjacentMines).toBe(1);
    expect(board[8][8].adjacentMines).toBe(0);
  });

  it('rejeita coordenadas fora do campo antes de distribuir as minas', () => {
    expect(() => generateBoard('30x16', { row: 16, column: 0 }, () => 0)).toThrow(RangeError);
  });
});
