import type { Cell, Position } from './board';

export function toggleFlag(board: Cell[][], { row, column }: Position): Cell[][] {
  const cell = board[row]?.[column];
  if (!cell) throw new RangeError('Célula fora do tabuleiro');
  if (cell.revealed) return board;

  const next = board.slice();
  next[row] = board[row].slice();
  next[row][column] = { ...cell, flagged: !cell.flagged };
  return next;
}
