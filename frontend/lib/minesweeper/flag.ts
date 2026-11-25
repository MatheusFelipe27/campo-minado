import { BOARD_SIZES, type BoardSize, type Cell, type Position } from './board';

export function remainingMines(size: BoardSize, board: Cell[][]): number {
  const flags = board.flat().filter(cell => cell.flagged).length;
  return BOARD_SIZES[size].mines - flags;
}

export function toggleFlag(board: Cell[][], { row, column }: Position): Cell[][] {
  const cell = board[row]?.[column];
  if (!cell) throw new RangeError('Célula fora do tabuleiro');
  if (cell.revealed) return board;

  const next = board.slice();
  next[row] = board[row].slice();
  next[row][column] = { ...cell, flagged: !cell.flagged };
  return next;
}
